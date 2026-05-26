import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('[webhook] signature error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // ── Idempotency guard ─────────────────────────────────────────────────────
  // Stripe retries on timeout — reject duplicates before any processing.
  try {
    await prisma.stripeEvent.create({ data: { id: event.id } });
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Already processed — acknowledge and exit
      return NextResponse.json({ received: true });
    }
    throw err;
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const s    = event.data.object as Stripe.Checkout.Session;
        const meta = s.metadata ?? {};

        if (s.mode === 'setup') {
          const customerId    = s.customer as string;
          const setupIntentId = s.setup_intent as string;
          if (customerId && setupIntentId) {
            const si   = await stripe.setupIntents.retrieve(setupIntentId);
            const pmId = typeof si.payment_method === 'string' ? si.payment_method : null;
            if (pmId) {
              await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: pmId },
              });
            }
          }

        } else if (meta.type === 'subscription') {
          if (!meta.userId || !meta.planId) break;
          const validPlans = ['FREE', 'BASIC', 'PRO', 'PREMIUM'];
          if (!validPlans.includes(meta.planId)) break;
          await prisma.user.update({
            where: { id: meta.userId },
            data: {
              plan:                 meta.planId as any,
              stripeCustomerId:     s.customer     as string,
              stripeSubscriptionId: s.subscription as string,
            },
          });

        } else if (meta.type === 'lead_payment' && meta.conversationId && !meta.leadId) {
          // Legacy path: conversation already created, just mark charged
          try {
            await prisma.conversation.update({
              where: { id: meta.conversationId },
              data:  { feeStatus: 'charged' },
            });
          } catch { /* already charged or deleted — ignore */ }

        } else if (meta.type === 'lead_payment') {
          const { leadId, cleanerId, wave } = meta;
          if (!leadId || !cleanerId) break;

          const waveNum         = Number(wave ?? 2);
          const paymentIntentId = s.payment_intent as string | null;

          let refund   = false;
          let clientId: string | null = null;

          try {
            await prisma.$transaction(async tx => {
              const lead = await tx.lead.findUnique({
                where:  { id: leadId },
                select: { id: true, clientId: true, status: true, cleanerId: true, leadPrice: true },
              });
              if (!lead) { refund = true; return; }

              // Use authoritative price from DB — never trust metadata
              const leadPriceNum = lead.leadPrice ?? 15;

              // Instant Book: verify the 10-minute window hasn't expired
              if (waveNum === 0) {
                const dist = await tx.leadDistribution.findFirst({
                  where:  { leadId, cleanerId, wave: 0, status: 'INVITED' },
                  select: { expiresAt: true },
                });
                if (!dist || (dist.expiresAt && dist.expiresAt < new Date())) {
                  refund = true;
                  return;
                }
              }

              // Wave 2 race: another cleaner already won — refund this payment
              if (waveNum === 2 && lead.status === 'ACCEPTED' && lead.cleanerId !== cleanerId) {
                refund = true;
                return;
              }

              clientId = lead.clientId;

              await tx.conversation.create({
                data: { leadId, clientId: lead.clientId, cleanerId, leadFee: leadPriceNum, feeStatus: 'charged' },
              });

              await tx.lead.update({
                where: { id: leadId },
                data:  { status: 'IN_REVIEW', cleanerId },
              });

              await tx.leadDistribution.updateMany({
                where: { leadId, cleanerId, wave: waveNum },
                data:  { status: 'ACCEPTED', respondedAt: new Date() },
              });

              if (waveNum === 2) {
                await tx.leadDistribution.updateMany({
                  where: { leadId, wave: 2, cleanerId: { not: cleanerId } },
                  data:  { status: 'LOST' },
                });
              }

              await tx.cleanerStats.upsert({
                where:  { cleanerId },
                create: { cleanerId, totalLeads: 1 },
                update: { totalLeads: { increment: 1 } },
              });
            });
          } catch (txErr: any) {
            if (txErr.code !== 'P2002') throw txErr;
            // P2002 = conversation unique constraint — already created, skip
          }

          if (refund && paymentIntentId) {
            await stripe.refunds.create({ payment_intent: paymentIntentId }).catch(e =>
              console.error('[webhook] refund failed:', e)
            );
          } else if (clientId) {
            createNotification({
              userId: clientId,
              type:   'cleaner_responded',
              title:  'Cleaner available!',
              body:   'A professional responded to your request. Accept or decline.',
              link:   '/dashboard/client',
            }).catch(() => {});
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        if (sub.status === 'active') {
          const planId = sub.metadata?.planId;
          if (planId) {
            await prisma.user.update({
              where: { id: userId },
              data:  { plan: planId as any, stripeSubscriptionId: sub.id },
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data:  { plan: 'FREE', stripeSubscriptionId: null },
        });
        break;
      }

    }
  } catch (err) {
    console.error('[webhook] handler error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
