// Testimonials for the home page.
//
// Only real people with a real experience of Verliks, quoted with their
// permission. US law bans invented testimonials and reviews from customers who do
// not exist (FTC rule, 16 CFR Part 465), with civil penalties per violation. If
// the person is a friend, relative or employee, the quote must say so.
//
// The section stays hidden until there are three. SAMPLE_TESTIMONIALS exist only so
// the team can see the design at /?preview=testimonials; the public never gets them.

export type Testimonial = {
  /** As the person agreed to be shown, e.g. "Maria S." */
  name: string;
  /** The line under the name, e.g. "Deep Cleaning · Hartford, CT" or "Cleaner · Waterbury, CT". */
  detail: string;
  quote: string;
  /** Optional, with the person's consent: a file in /public, e.g. "/images/testimonials/maria.jpg". */
  photo?: string;
};

export const TESTIMONIALS: Testimonial[] = [];

export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Jessica M.',
    detail: 'Standard Cleaning · Hartford, CT',
    quote: 'I sent the request on my lunch break and had a reply that afternoon. We agreed on the price in the chat before anything was booked.',
  },
  {
    name: 'Daniel R.',
    detail: 'Move-Out Cleaning · New Haven, CT',
    quote: 'Moving week was chaos. The cleaner did the empty apartment top to bottom, cabinets and oven included, and the landlord had nothing to flag.',
  },
  {
    name: 'Ana P.',
    detail: 'Cleaner · Waterbury, CT',
    quote: 'I pick the requests I want and only pay when a client chooses me. Signing up was free, and my ID was reviewed in a day.',
  },
];
