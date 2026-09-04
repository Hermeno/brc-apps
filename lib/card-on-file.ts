import type Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { logError, logInfo } from '@/lib/logger';
import { createNotification } from '@/lib/notifications';

type CustomerOwner = {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
};

/** The user's Stripe customer id, creating and persisting one on first use. */
export async function ensureStripeCustomer(user: CustomerOwner): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email:    user.email,
    name:     user.name ?? undefined,
    metadata: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: user.id },
    data:  { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export type CardOnFile = {
  /** false when Stripe could not be reached — "no card" is then unknown, not proven. */
  ok: boolean;
  defaultPaymentMethodId: string | null;
  cards: Stripe.PaymentMethod[];
};

/**
 * Single source of truth for "does this cleaner have a chargeable card on file".
 *
 * Auto-charging depends on two pieces of state that used to be written only by the
 * `checkout.session.completed` webhook: the customer's default_payment_method and
 * User.hasPaymentMethod. A missed or delayed webhook left the card attached in
 * Stripe but invisible to the platform — no auto-charge, and matching skipped the
 * cleaner entirely. Detaching a default card left the same hole. So this reads the
 * live Stripe state and repairs both, and every card-aware path calls it instead of
 * trusting stored state.
 */
export async function syncCardOnFile(customerId: string): Promise<CardOnFile> {
  try {
    const [customer, methods] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 20 }),
    ]);

    // list() returns newest first — index 0 is the most recently added card.
    const cards = methods.data;

    let defaultId =
      !('deleted' in customer) && typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null;

    // The stored default may point at a card that has since been detached.
    if (defaultId && !cards.some(c => c.id === defaultId)) defaultId = null;

    if (!defaultId && cards.length > 0) {
      defaultId = cards[0].id;
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: defaultId },
      });
    }

    const hasCard = cards.length > 0;
    // Only write when the flag actually disagrees with Stripe.
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId, hasPaymentMethod: !hasCard },
      data:  { hasPaymentMethod: hasCard },
    });

    return { ok: true, defaultPaymentMethodId: defaultId, cards };
  } catch (err) {
    logError('[syncCardOnFile]', err);
    return { ok: false, defaultPaymentMethodId: null, cards: [] };
  }
}

/** Promotes a specific card to default and marks the cleaner as chargeable. */
export async function setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data:  { hasPaymentMethod: true },
  });
}

const CARD_NOTIFY_DEDUPE_MINUTES = 10;

/**
 * Confirms to the cleaner that a card is on file — and leaves a trail the admin
 * panel can show. Deliberately says only that a card was saved: no digits, no
 * brand, no cardholder name.
 *
 * Every save path can call this (setup return, webhook, lead payment), and they
 * often fire for the same card, so a recent notification suppresses duplicates.
 */
export async function notifyCardSaved(customerId: string): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      where:  { stripeCustomerId: customerId },
      select: { id: true },
    });

    const since = new Date(Date.now() - CARD_NOTIFY_DEDUPE_MINUTES * 60 * 1000);

    for (const user of users) {
      const recent = await prisma.notification.findFirst({
        where:  { userId: user.id, type: 'card_added', createdAt: { gte: since } },
        select: { id: true },
      });
      if (recent) continue;

      await createNotification({
        userId: user.id,
        type:   'card_added',
        title:  'Card added',
        body:   'Your card is saved. Lead fees are now charged automatically — no manual payment needed.',
        link:   '/dashboard/payment-methods',
      });

      // Surfaces in the admin activity log alongside the users table badge.
      logInfo('[card-on-file]', 'Card added', { customerId }, user.id);
    }
  } catch (err) {
    logError('[notifyCardSaved]', err);
  }
}

export type LeadChargeResult =
  | { status: 'charged';         paymentIntentId: string }
  | { status: 'no_card' }
  | { status: 'requires_action'; paymentIntentId: string }
  | { status: 'failed';          reason: string };

/**
 * Charges the lead fee to the cleaner's saved card without them being present.
 * Returns a result instead of throwing so callers can fall back to a manual
 * payment wall — a declined card must never break lead acceptance.
 */
export async function chargeLeadFeeOnFile(opts: {
  customerId:  string;
  amount:      number; // dollars
  description: string;
  metadata:    Record<string, string>;
}): Promise<LeadChargeResult> {
  const { defaultPaymentMethodId } = await syncCardOnFile(opts.customerId);
  if (!defaultPaymentMethodId) return { status: 'no_card' };

  try {
    const pi = await stripe.paymentIntents.create({
      amount:         Math.round(opts.amount * 100),
      currency:       'usd',
      customer:       opts.customerId,
      payment_method: defaultPaymentMethodId,
      confirm:        true,
      off_session:    true,
      // The cleaner is not at the keyboard, so a redirect-based method can't complete.
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      description: opts.description,
      metadata:    opts.metadata,
    });

    if (pi.status === 'succeeded')       return { status: 'charged', paymentIntentId: pi.id };
    if (pi.status === 'requires_action') return { status: 'requires_action', paymentIntentId: pi.id };
    return { status: 'failed', reason: pi.status };
  } catch (err: any) {
    // Declines arrive as exceptions on off-session confirms.
    logError('[chargeLeadFeeOnFile]', err);
    return { status: 'failed', reason: err?.code ?? err?.decline_code ?? 'charge_error' };
  }
}
