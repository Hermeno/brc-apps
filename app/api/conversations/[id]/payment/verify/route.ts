import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { syncCardOnFile, notifyCardSaved } from '@/lib/card-on-file';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// Called by the chat page when returning from Stripe checkout (?paid=1&cs=SESSION_ID).
// Verifies the session directly with Stripe so we don't depend on webhook timing.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ ok: false });

    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== 'CLEANER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const conv = await prisma.conversation.findUnique({
      where:  { id },
      select: { id: true, cleanerId: true, feeStatus: true },
    });
    if (!conv || conv.cleanerId !== user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Already marked charged — nothing to do
    if (conv.feeStatus === 'charged' || conv.feeStatus === 'waived') {
      return NextResponse.json({ ok: true });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (stripeSession.payment_status === 'paid' && stripeSession.metadata?.conversationId === id) {
      await prisma.conversation.update({
        where: { id },
        data:  { feeStatus: 'charged', feeDeadline: null },
      });

      // Checkout saved the card off-session — promote it so the next lead is automatic.
      const customerId = typeof stripeSession.customer === 'string' ? stripeSession.customer : null;
      if (customerId) {
        const { defaultPaymentMethodId, cards } = await syncCardOnFile(customerId);
        if (defaultPaymentMethodId && cards.length > 0) await notifyCardSaved(customerId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError('[POST /api/conversations/payment/verify]', err);
    return NextResponse.json({ ok: false });
  }
}
