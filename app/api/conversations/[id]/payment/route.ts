import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { ensureStripeCustomer, chargeLeadFeeOnFile } from '@/lib/card-on-file';
import { NextRequest, NextResponse } from 'next/server';

// GET — charges the saved card if there is one, otherwise returns a Stripe
// Checkout URL for the cleaner to pay the lead fee manually.
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

  const customerId = await ensureStripeCustomer(user);

  // Try the card on file first — the whole point of saving it.
  const charge = await chargeLeadFeeOnFile({
    customerId,
    amount:      leadFee,
    description: `Lead fee — ${conversation.lead.serviceType}`,
    metadata:    { type: 'lead_payment', conversationId: id, cleanerId: user.id, leadId: conversation.leadId },
  });

  if (charge.status === 'charged') {
    await prisma.conversation.update({
      where: { id },
      data:  { feeStatus: 'charged', feeDeadline: null },
    });
    return NextResponse.json({ alreadyPaid: true, autoCharged: true });
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
    // Keep the card on file so the next lead charges automatically.
    payment_intent_data: {
      setup_future_usage: 'off_session',
      // PaymentIntent metadata carries leadId for refund searches in decline/cancel.
      metadata: { type: 'lead_payment', conversationId: id, cleanerId: user.id, leadId: conversation.leadId },
    },
    success_url: `${BASE_URL}/dashboard/chat/${id}?paid=1&cs={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${BASE_URL}/dashboard/chat/${id}`,
    // Checkout-session metadata drives webhook routing — keep it identical to the
    // legacy shape (conversationId, no leadId) so the webhook takes the correct
    // "mark-charged" branch instead of the wave-creation branch.
    metadata: { type: 'lead_payment', conversationId: id, cleanerId: user.id },
  });

  return NextResponse.json({
    checkoutUrl: checkoutSession.url,
    leadFee,
    // Tells the caller why the card on file didn't cover it.
    cardStatus: charge.status,
  });
}
