import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// Creates a PaymentIntent for the lead fee.
// setup_future_usage=off_session so Stripe saves the card for future auto-charges.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, name: true, email: true, role: true, stripeCustomerId: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const conv = await prisma.conversation.findUnique({
      where:   { id },
      include: { lead: { select: { serviceType: true, address: true } } },
    });
    if (!conv || conv.cleanerId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (conv.feeStatus === 'charged' || conv.feeStatus === 'waived') {
      return NextResponse.json({ alreadyPaid: true });
    }

    const leadFee = conv.leadFee;
    if (!leadFee || leadFee <= 0) {
      await prisma.conversation.update({ where: { id }, data: { feeStatus: 'waived' } });
      return NextResponse.json({ alreadyPaid: true });
    }

    // Ensure Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    user.email,
        name:     user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const pi = await stripe.paymentIntents.create({
      amount:   Math.round(leadFee * 100),
      currency: 'usd',
      customer: customerId,
      // Save card for future off-session auto-charges
      setup_future_usage: 'off_session',
      automatic_payment_methods: { enabled: true },
      description: `Lead fee — ${conv.lead.serviceType}`,
      metadata: { type: 'lead_payment', conversationId: id, cleanerId: user.id, leadId: conv.leadId },
    });

    return NextResponse.json({ clientSecret: pi.client_secret, leadFee });
  } catch (err) {
    logError('[POST /api/conversations/payment/intent]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
