import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, stripeCustomerId: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'setup',
      currency: 'usd',
      customer: customerId,
      success_url: `${BASE_URL}/dashboard/payment-methods?setup=1`,
      cancel_url: `${BASE_URL}/dashboard/payment-methods`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    logError('[POST /api/stripe/setup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
