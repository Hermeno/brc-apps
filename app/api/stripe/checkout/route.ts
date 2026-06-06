import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { PLANS } from '@/lib/pricing';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, role: true, stripeCustomerId: true, plan: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { planId } = await req.json();
    if (!['BASIC', 'PRO'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planDef = PLANS.find(p => p.id === planId);
    const dbConfig = await prisma.planConfig.findUnique({ where: { id: planId } });
    const price = dbConfig?.price ?? planDef?.price ?? 0;

    if (price <= 0) return NextResponse.json({ error: 'Invalid price' }, { status: 400 });

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
      line_items: [{
        price_data: {
          currency:   'usd',
          unit_amount: Math.round(price * 100),
          recurring:  { interval: 'month' },
          product_data: { name: `${planDef?.name ?? planId} Plan` },
        },
        quantity: 1,
      }],
      success_url: `${BASE_URL}/dashboard/plan?upgraded=1`,
      cancel_url:  `${BASE_URL}/dashboard/plan`,
      metadata: { type: 'subscription', userId: user.id, planId },
      subscription_data: {
        metadata: { userId: user.id, planId },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error('[POST /api/stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
