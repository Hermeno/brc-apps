import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, BASE_URL } from '@/lib/stripe';
import { ensureStripeCustomer } from '@/lib/card-on-file';
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

    const customerId = await ensureStripeCustomer(user);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode:     'setup',
      currency: 'usd',
      customer: customerId,
      // Checkout's setup mode already creates the SetupIntent with off_session
      // usage, which is what lead-fee auto-charges need.
      // cs lets the page confirm the card server-side on return, so saving the
      // card never depends on the webhook arriving.
      success_url: `${BASE_URL}/dashboard/payment-methods?setup=1&cs={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${BASE_URL}/dashboard/payment-methods`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    logError('[POST /api/stripe/setup]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
