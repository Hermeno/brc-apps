import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

// GET — returns a Stripe Checkout URL for the cleaner to pay the lead fee
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, stripeCustomerId: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { lead: { select: { serviceType: true, address: true } } },
  });

  if (!conversation || conversation.cleanerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (conversation.feeStatus === 'charged' || conversation.feeStatus === 'waived') {
    return NextResponse.json({ alreadyPaid: true });
  }

  const leadFee = conversation.leadFee;
  if (!leadFee || leadFee <= 0) {
    // Waive and allow access
    await prisma.conversation.update({ where: { id }, data: { feeStatus: 'waived' } });
    return NextResponse.json({ alreadyPaid: true });
  }

  // Ensure Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  // Try auto-charge from saved default card first
  const customer = await stripe.customers.retrieve(customerId);
  const defaultPM =
    !('deleted' in customer) && typeof customer.invoice_settings?.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : null;

  if (defaultPM) {
    try {
      const pi = await stripe.paymentIntents.create({
        amount:         Math.round(leadFee * 100),
        currency:       'usd',
        customer:       customerId,
        payment_method: defaultPM,
        confirm:        true,
        off_session:    true,
        description:    `Lead fee — ${conversation.lead.serviceType}`,
        metadata:       { type: 'lead_payment', conversationId: id, cleanerId: user.id, leadId: conversation.leadId },
      });
      if (pi.status === 'succeeded') {
        await prisma.conversation.update({ where: { id }, data: { feeStatus: 'charged' } });
        return NextResponse.json({ alreadyPaid: true, autoCharged: true });
      }
    } catch {
      // Card declined — fall through to checkout
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer:    customerId,
    mode:        'payment',
    line_items:  [{
      price_data: {
        currency:     'usd',
        unit_amount:  Math.round(leadFee * 100),
        product_data: { name: `Lead fee — ${conversation.lead.serviceType}`, description: conversation.lead.address },
      },
      quantity: 1,
    }],
    success_url: `${BASE_URL}/dashboard/chat/${id}?paid=1`,
    cancel_url:  `${BASE_URL}/dashboard/chat/${id}`,
    // Checkout-session metadata drives webhook routing — keep it identical to the
    // legacy shape (conversationId, no leadId) so the webhook takes the correct
    // "mark-charged" branch instead of the wave-creation branch.
    metadata: { type: 'lead_payment', conversationId: id, cleanerId: user.id },
    payment_intent_data: {
      // PaymentIntent metadata carries leadId for refund searches in decline/cancel.
      metadata: { type: 'lead_payment', conversationId: id, cleanerId: user.id, leadId: conversation.leadId },
    },
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url, leadFee });
}
