import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
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

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const s    = event.data.object as Stripe.Checkout.Session;
        const meta = s.metadata ?? {};

        if (s.mode === 'setup') {
          // Card setup completed — set as default payment method
          const customerId = s.customer as string;
          const setupIntentId = s.setup_intent as string;
          if (customerId && setupIntentId) {
            const si = await stripe.setupIntents.retrieve(setupIntentId);
            const pmId = typeof si.payment_method === 'string' ? si.payment_method : null;
            if (pmId) {
              await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: pmId },
              });
            }
          }

        } else if (meta.type === 'subscription') {
          if (!meta.userId || !meta.planId) break;
          const validPlans = ['FREE', 'BASIC', 'PREMIUM', 'PRO'];
          if (!validPlans.includes(meta.planId)) break;
          await prisma.user.update({
            where: { id: meta.userId },
            data: {
              plan:                meta.planId as any,
              stripeCustomerId:    s.customer    as string,
              stripeSubscriptionId: s.subscription as string,
            },
          });

        } else if (meta.type === 'lead_payment') {
          await prisma.conversation.update({
            where: { id: meta.conversationId },
            data:  { feeStatus: 'charged' },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        // If subscription is cancelled/past_due, keep current plan until period ends
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
