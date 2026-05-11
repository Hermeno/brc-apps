import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  BASIC:   process.env.STRIPE_BASIC_PRICE_ID,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID,
  PRO:     process.env.STRIPE_PRO_PRICE_ID,
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
