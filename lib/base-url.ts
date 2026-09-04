// Public origin of the app, used to build absolute links in emails and in
// redirects back from Stripe.
//
// Falls back to the production domain, not localhost — NEXT_PUBLIC_BASE_URL
// isn't set on DigitalOcean, and an unset var must not send users to localhost
// in production. Local dev overrides this via .env.
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://verliks.com';
