// Public origin of the app, used to build absolute links in emails and in
// redirects back from Stripe.
//
// Falls back to the production domain, not localhost: an unset var must not send
// users to localhost in production. Local dev overrides this via .env. The trailing
// slash is dropped because callers append "/path" (DigitalOcean has "https://verliks.com/").
export const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://verliks.com').replace(/\/+$/, '');
