import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { serviceLabel } from './estimate';
import { logError } from './logger';

// The home page's testimonials section.
// Reviews are real: written by clients after a job, shown under the license in
// section 16 of the Terms ("Reviews and Content"), with the first name and last
// initial only. Until the first one exists, the section shows the scenarios
// below instead, labeled as examples rather than reviews.

export type Testimonial = {
  kind: 'scenario' | 'review';
  /** Display name for a review (first name, last initial), or title for a scenario. */
  name: string;
  /** Review context or scenario audience. */
  detail: string;
  /** The review quote or a plain-language scenario description. */
  quote: string;
};

export const SCENARIOS: Testimonial[] = [
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

const shortName = (name: string | null) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Verliks client';
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
};

/** Up to 24 real reviews, four or five stars, with a comment short enough to read in full. Newest first. */
export const getReviewTestimonials = unstable_cache(async (): Promise<Testimonial[]> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { rating: { gte: 4 }, comment: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: { comment: true, client: { select: { name: true } }, lead: { select: { serviceType: true } } },
    });
    return reviews
      .map(r => ({ quote: (r.comment ?? '').trim(), client: r.client?.name ?? null, service: r.lead?.serviceType ?? '' }))
      .filter(r => r.quote.length >= 20 && r.quote.length <= 320)
      .slice(0, 24)
      .map(r => ({
        kind: 'review' as const,
        name: shortName(r.client),
        detail: r.service ? `Client · ${serviceLabel(r.service, 'en')}` : 'Client',
        quote: r.quote,
      }));
  } catch (err) {
    logError('[testimonials]', err); // the home page never breaks over this section
    return [];
  }
}, ['home-testimonials'], { revalidate: 600 });
