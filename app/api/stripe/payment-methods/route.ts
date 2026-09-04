import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncCardOnFile } from '@/lib/card-on-file';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return NextResponse.json({ paymentMethods: [], defaultId: null });

    // Reconciles Stripe with our stored state: promotes a default card when one is
    // missing and fixes hasPaymentMethod, so simply opening this page repairs an
    // account whose setup webhook never landed.
    const { cards, defaultPaymentMethodId } = await syncCardOnFile(user.stripeCustomerId);

    const paymentMethods = cards.map(pm => ({
      id:        pm.id,
      brand:     pm.card?.brand ?? 'card',
      last4:     pm.card?.last4 ?? '????',
      expMonth:  pm.card?.exp_month,
      expYear:   pm.card?.exp_year,
      isDefault: pm.id === defaultPaymentMethodId,
    }));

    return NextResponse.json({ paymentMethods, defaultId: defaultPaymentMethodId });
  } catch (err: any) {
    logError('[GET /api/stripe/payment-methods]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
