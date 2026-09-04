import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { setDefaultPaymentMethod, syncCardOnFile, notifyCardSaved } from '@/lib/card-on-file';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// Called by the payment-methods page when returning from Stripe setup checkout
// (?setup=1&cs=SESSION_ID). Saves the card as the default for off-session lead
// charges without waiting on the webhook, which may be delayed or unconfigured.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sessionId } = await req.json();

    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return NextResponse.json({ ok: false, hasCard: false });

    if (sessionId) {
      const checkout = await stripe.checkout.sessions.retrieve(sessionId);

      // Only act on this user's own completed setup session.
      if (checkout.customer !== user.stripeCustomerId || checkout.mode !== 'setup') {
        return NextResponse.json({ error: 'Session mismatch' }, { status: 400 });
      }

      const setupIntentId = typeof checkout.setup_intent === 'string' ? checkout.setup_intent : null;
      if (setupIntentId) {
        const si   = await stripe.setupIntents.retrieve(setupIntentId);
        const pmId = typeof si.payment_method === 'string' ? si.payment_method : null;
        if (si.status === 'succeeded' && pmId) {
          await setDefaultPaymentMethod(user.stripeCustomerId, pmId);
          await notifyCardSaved(user.stripeCustomerId);
        }
      }
    }

    // Reconcile with Stripe either way, so a card added outside this flow
    // (billing portal, an earlier lead payment) is picked up too.
    const { ok, cards, defaultPaymentMethodId } = await syncCardOnFile(user.stripeCustomerId);

    return NextResponse.json({
      ok,
      hasCard:   cards.length > 0,
      defaultId: defaultPaymentMethodId,
    });
  } catch (err) {
    logError('[POST /api/stripe/setup/confirm]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
