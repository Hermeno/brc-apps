import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
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

    const [methods, customer] = await Promise.all([
      stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' }),
      stripe.customers.retrieve(user.stripeCustomerId),
    ]);

    const defaultId =
      !('deleted' in customer) && typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null;

    const paymentMethods = methods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand ?? 'card',
      last4: pm.card?.last4 ?? '????',
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === defaultId,
    }));

    return NextResponse.json({ paymentMethods, defaultId });
  } catch (err: any) {
    logError('[GET /api/stripe/payment-methods]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
