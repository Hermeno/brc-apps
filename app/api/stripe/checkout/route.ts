import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, PLAN_PRICE_IDS, BASE_URL } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true, stripeCustomerId: true, plan: true },
  });
  if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { planId } = await req.json();
  const priceId = PLAN_PRICE_IDS[planId];
  if (!priceId) return NextResponse.json({ error: 'Plano inválido ou sem price ID configurado' }, { status: 400 });

  // Find or create Stripe customer
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

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${BASE_URL}/dashboard/plan?upgraded=1`,
    cancel_url:  `${BASE_URL}/dashboard/plan`,
    metadata: { type: 'subscription', userId: user.id, planId },
    subscription_data: {
      metadata: { userId: user.id, planId },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
