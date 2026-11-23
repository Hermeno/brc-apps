// Testimonials on the home page.

export type Testimonial = {
  /** As the person agreed to be shown, e.g. "Maria S." */
  name: string;
  /** The line under the name, e.g. "Deep Cleaning · Hartford, CT" or "Cleaner · Waterbury, CT". */
  detail: string;
  quote: string;
  /** Optional, with the person's consent: a file in /public, e.g. "/images/testimonials/maria.jpg". */
  photo?: string;
};

// The three below are launch examples. When real ones (with permission) replace them,
// set this to false. While true, the page says they are examples: US law (FTC rule,
// 16 CFR Part 465) bans presenting invented testimonials as real customers.
export const SHOWING_SAMPLES = true;

// Keep quotes under ~130 characters and the detail line short: longer text is cut to fit the card.
export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Jessica M.',
    detail: 'Standard Cleaning · Hartford, CT',
    quote: 'I sent the request on my lunch break and had a reply that afternoon. We agreed on the price in the chat before anything was booked.',
  },
  {
    name: 'Daniel R.',
    detail: 'Move-Out · New Haven, CT',
    quote: 'Moving week was chaos. The cleaner left the empty apartment spotless, cabinets and oven included.',
  },
  {
    name: 'Ana P.',
    detail: 'Cleaner · Waterbury, CT',
    quote: 'I pick the requests I want and only pay when a client chooses me. Signing up was free, and my ID was reviewed in a day.',
  },
];
