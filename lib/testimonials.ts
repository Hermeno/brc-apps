// Testimonials on the home page.

export type Testimonial = {
  kind: 'scenario' | 'review';
  /** Consented display name for a review, or title for a scenario. */
  name: string;
  /** Review context or scenario audience. */
  detail: string;
  /** The review quote or a plain-language scenario description. */
  quote: string;
  /** Optional review photo, used only with the person's consent. */
  photo?: string;
};

// Scenario entries explain the flow; review entries must come from people who
// agreed to be shown. The display mode is derived from the entries below.
export const TESTIMONIALS: Testimonial[] = [
  {
    kind: 'scenario',
    name: 'A routine clean',
    detail: 'For clients',
    quote: 'Describe your home and the work you need. Discuss the scope and price with a cleaner before deciding whether to book.',
  },
  {
    kind: 'scenario',
    name: 'A move-out clean',
    detail: 'For clients',
    quote: 'List the rooms, cabinets and appliances that need attention so cleaners can respond to the job you actually have.',
  },
  {
    kind: 'scenario',
    name: 'A job that fits',
    detail: 'For cleaners',
    quote: 'Choose your services and coverage area, review matching requests, and reply only to the work you want to take on.',
  },
];

export const SHOWING_SAMPLES = TESTIMONIALS.some(item => item.kind === 'scenario');
