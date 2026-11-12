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

// Plans bill against catalog prices, so Stripe groups subscriptions under one product
// per plan. The amount still comes from PlanConfig; a changed amount gets a new price
// (the old one is archived — existing subscribers keep it).
export async function planPriceId(planId: string, name: string, amount: number): Promise<string> {
  const lookup_key  = `verliks_${planId.toLowerCase()}_monthly`;
  const unit_amount = Math.round(amount * 100);
  const [current]   = (await stripe.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 })).data;
  if (current?.unit_amount === unit_amount) return current.id;

  const price = await stripe.prices.create({
    currency: 'usd', unit_amount, recurring: { interval: 'month' }, lookup_key, transfer_lookup_key: true,
    ...(current ? { product: current.product as string } : { product_data: { name: `Verliks ${name}` } }),
  });
  if (current) await stripe.prices.update(current.id, { active: false });
  return price.id;
}

// Re-exported so the existing `import { BASE_URL } from '@/lib/stripe'` callers
// keep working; it lives in lib/base-url so modules that only need a link (email
// notifications) don't have to pull in the Stripe SDK.
export { BASE_URL } from './base-url';
