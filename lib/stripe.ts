import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return _stripe;
}

// Keep named export for backwards compat — resolves lazily
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  BASIC: process.env.STRIPE_BASIC_PRICE_ID,
  PRO:   process.env.STRIPE_PRO_PRICE_ID,
};

// Re-exported so the existing `import { BASE_URL } from '@/lib/stripe'` callers
// keep working; it lives in lib/base-url so modules that only need a link (email
// notifications) don't have to pull in the Stripe SDK.
export { BASE_URL } from './base-url';
