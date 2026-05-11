import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { createNotification } from '@/lib/notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'CLIENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { lead: { select: { serviceType: true, address: true } } },
  });
  if (!conversation || conversation.clientId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Accept this cleaner: lead → ACCEPTED, close all other conversations
  await prisma.$transaction([
    prisma.lead.update({
      where: { id: conversation.leadId },
      data:  { status: 'ACCEPTED', cleanerId: conversation.cleanerId },
    }),
    prisma.conversation.updateMany({
      where: { leadId: conversation.leadId, id: { not: id } },
      data:  { status: 'closed' },
    }),
    prisma.conversation.update({ where: { id }, data: { status: 'active' } }),
  ]);

  // ── Charge the cleaner the lead fee ──────────────────────────────────────
  const leadFee = conversation.leadFee;
  if (!leadFee || leadFee <= 0 || conversation.feeStatus === 'charged') {
    createNotification({
      userId: conversation.cleanerId,
      type:   'client_accepted',
      title:  'Cliente aceitou você!',
      body:   'Você foi aceito. Acesse o chat para continuar.',
      link:   `/dashboard/chat/${id}`,
    }).catch(() => {});
    return NextResponse.json({ ok: true, conversationId: id });
  }

  try {
    const cleaner = await prisma.user.findUnique({
      where: { id: conversation.cleanerId },
      select: { id: true, name: true, email: true, stripeCustomerId: true },
    });
    if (!cleaner) return NextResponse.json({ ok: true, conversationId: id });

    // Ensure Stripe customer
    let customerId = cleaner.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: cleaner.email,
        name:  cleaner.name ?? undefined,
        metadata: { userId: cleaner.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: cleaner.id }, data: { stripeCustomerId: customerId } });
    }

    // Try auto-charge from saved default card
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPM =
      !('deleted' in customer) && typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null;

    if (defaultPM) {
      const pi = await stripe.paymentIntents.create({
        amount:         Math.round(leadFee * 100),
        currency:       'brl',
        customer:       customerId,
        payment_method: defaultPM,
        confirm:        true,
        off_session:    true,
        description:    `Taxa do lead — ${conversation.lead.serviceType}`,
        metadata:       { type: 'lead_payment', conversationId: id, cleanerId: cleaner.id },
      });

      if (pi.status === 'succeeded') {
        await prisma.conversation.update({ where: { id }, data: { feeStatus: 'charged' } });
        createNotification({
          userId: conversation.cleanerId,
          type:   'client_accepted',
          title:  'Cliente aceitou você!',
          body:   'Você foi aceito. O pagamento do lead foi processado. Acesse o chat.',
          link:   `/dashboard/chat/${id}`,
        }).catch(() => {});
        return NextResponse.json({ ok: true, conversationId: id, charged: true });
      }
    }

    // No saved card — return checkout URL for the cleaner to pay
    const checkoutSession = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        'payment',
      line_items:  [{
        price_data: {
          currency:     'brl',
          unit_amount:  Math.round(leadFee * 100),
          product_data: { name: `Taxa do lead — ${conversation.lead.serviceType}`, description: conversation.lead.address },
        },
        quantity: 1,
      }],
      success_url: `${BASE_URL}/dashboard/chat/${id}?paid=1`,
      cancel_url:  `${BASE_URL}/dashboard/marketplace`,
      metadata:    { type: 'lead_payment', conversationId: id, cleanerId: cleaner.id },
    });

    createNotification({
      userId: conversation.cleanerId,
      type:   'client_accepted',
      title:  'Cliente aceitou você!',
      body:   'Você foi aceito. Complete o pagamento do lead para acessar o chat.',
      link:   `/dashboard/chat/${id}`,
    }).catch(() => {});
    return NextResponse.json({ ok: true, conversationId: id, cleanerCheckoutUrl: checkoutSession.url });
  } catch (e: any) {
    console.error('[confirm] payment error:', e?.message);
    createNotification({
      userId: conversation.cleanerId,
      type:   'client_accepted',
      title:  'Cliente aceitou você!',
      body:   'Você foi aceito. Acesse o chat para continuar.',
      link:   `/dashboard/chat/${id}`,
    }).catch(() => {});
    // Payment failed but acceptance still happened — allow chat
    return NextResponse.json({ ok: true, conversationId: id });
  }
}
