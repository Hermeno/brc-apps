import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return NextResponse.json({ error: 'Sem conta Stripe' }, { status: 400 });

    const pm = await stripe.paymentMethods.retrieve(id);
    if (pm.customer !== user.stripeCustomerId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await stripe.paymentMethods.detach(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logError('[DELETE /api/stripe/payment-methods/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return NextResponse.json({ error: 'Sem conta Stripe' }, { status: 400 });

    const pm = await stripe.paymentMethods.retrieve(id);
    if (pm.customer !== user.stripeCustomerId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    logError('[POST /api/stripe/payment-methods/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
