import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL, planPriceId } from '@/lib/stripe';
import { PLANS } from '@/lib/pricing';
import { ensureStripeCustomer } from '@/lib/card-on-file';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

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

    // Promo pricing: admin set this plan's price to $0 — grant it directly,
    // no Stripe subscription needed. Cleaner keeps full plan perks (wave access,
    // CFS ranking bonus, radius) until the price is raised again.
    if (price <= 0) {
      await prisma.user.update({ where: { id: user.id }, data: { plan: planId } });
      return NextResponse.json({ granted: true, plan: planId });
    }

    const customerId = await ensureStripeCustomer(user);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: await planPriceId(planId, planDef?.name ?? planId, price), quantity: 1 }],
      // Cards only, so the card saved here also counts as the card on file for lead fees.
      payment_method_types: ['card'],
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
    logError('[POST /api/stripe/checkout]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
