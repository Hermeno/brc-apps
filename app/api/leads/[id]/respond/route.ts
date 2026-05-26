import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cleaner = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, stripeCustomerId: true, email: true, name: true },
  });
  if (!cleaner || cleaner.role !== 'CLEANER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: leadId } = await params;

  // Already paid → redirect to existing conversation
  const existing = await prisma.conversation.findUnique({
    where: { leadId_cleanerId: { leadId, cleanerId: cleaner.id } },
  });
  if (existing) {
    return NextResponse.json({ conversationId: existing.id, alreadyResponded: true });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { distributions: { where: { cleanerId: cleaner.id } } },
  });

  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const openStatuses = ['NEW', 'WAVE1', 'WAVE2', 'WAVE3', 'IN_REVIEW'];
  if (!openStatuses.includes(lead.status)) {
    return NextResponse.json({ error: 'This lead is no longer available' }, { status: 409 });
  }

  const dist = lead.distributions[0];
  if (!dist || dist.status === 'EXPIRED' || dist.status === 'LOST') {
    return NextResponse.json({ error: 'You were not invited to this lead or the time has expired' }, { status: 409 });
  }

  // Wave 2 pre-check: quick race guard before charging
  if (dist.wave === 2 && lead.status === 'ACCEPTED') {
    return NextResponse.json({ error: 'Another cleaner already accepted this lead' }, { status: 409 });
  }

  const leadPrice = lead.leadPrice ?? 15;

  // Ensure cleaner has a Stripe customer record
  let customerId = cleaner.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: cleaner.email ?? undefined,
      name:  cleaner.name  ?? undefined,
      metadata: { userId: cleaner.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: cleaner.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(leadPrice * 100),
        product_data: {
          name: `Lead fee — ${lead.serviceType}`,
          description: 'Unlocks client contact information for this lead',
        },
      },
    }],
    metadata: {
      type:       'lead_payment',
      leadId,
      cleanerId:  cleaner.id,
      wave:       String(dist.wave),
      leadPrice:  String(leadPrice),
    },
    payment_intent_data: {
      metadata: { type: 'lead_payment', leadId, cleanerId: cleaner.id },
    },
    success_url: `${BASE_URL}/dashboard/cleaner?lead_paid=1`,
    cancel_url:  `${BASE_URL}/dashboard/cleaner`,
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url, leadFee: leadPrice });
}
