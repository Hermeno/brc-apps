import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { serviceLabel } from './estimate';
import { logError } from './logger';

// The home page's testimonials section.
// Reviews are real: written by clients after a job, shown under the license in
// section 16 of the Terms ("Reviews and Content"), with the first name and last
// initial only. Until the first one exists, the home page leaves the section out:
// it never shows invented or illustrative quotes.

export type Testimonial = {
  kind: 'review';
  /** First name and last initial. */
  name: string;
  /** The line under the name, e.g. "Client · Deep Clean". */
  detail: string;
  quote: string;
};

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
