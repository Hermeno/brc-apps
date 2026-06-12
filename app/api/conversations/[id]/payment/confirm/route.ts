import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// Called after stripe.confirmPayment() succeeds on the client.
// Verifies payment with Stripe, saves card as default for future auto-charges,
// and marks the conversation fee as charged.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, role: true, stripeCustomerId: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const conv = await prisma.conversation.findUnique({
      where:  { id },
      select: { id: true, cleanerId: true, feeStatus: true },
    });
    if (!conv || conv.cleanerId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (conv.feeStatus === 'charged' || conv.feeStatus === 'waived') {
      return NextResponse.json({ ok: true });
    }

    // Verify with Stripe that the payment actually succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 });
    }
    if (pi.metadata?.conversationId !== id) {
      return NextResponse.json({ error: 'Payment mismatch' }, { status: 400 });
    }

    // Save the payment method as default so future auto-charges work
    const pmId = typeof pi.payment_method === 'string' ? pi.payment_method : null;
    if (pmId && user.stripeCustomerId) {
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: { default_payment_method: pmId },
      }).catch(() => {});
    }

    await prisma.conversation.update({
      where: { id },
      data:  { feeStatus: 'charged', feeDeadline: null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError('[POST /api/conversations/payment/confirm]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
