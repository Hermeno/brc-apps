import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

// Public home stats: real client reviews + real completed-job count.
// The landing page falls back to mockup content only when these are empty,
// so real data automatically replaces the placeholders as it appears.

function shortName(name: string | null): string {
  if (!name) return 'Client';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// Pull "City, ST" out of a US address string when present.
function cityFromAddress(address: string | null): string {
  if (!address) return '';
  const m = address.match(/,\s*([A-Za-z .'-]+),\s*([A-Z]{2})(?:\s+\d{5})?/);
  if (m) return `${m[1].trim()}, ${m[2]}`;
  return '';
}

export async function GET() {
  try {
    const [reviews, completedJobs] = await Promise.all([
      prisma.review.findMany({
        where: { comment: { not: null }, rating: { gte: 4 } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          rating: true, comment: true,
          client: { select: { name: true } },
          lead:   { select: { address: true } },
        },
      }).catch(() => [] as any[]),
      prisma.lead.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
    ]);

    const testimonials = reviews
      .filter(r => (r.comment ?? '').trim().length > 0)
      .map(r => ({
        quote: r.comment as string,
        name:  shortName(r.client?.name ?? null),
        city:  cityFromAddress(r.lead?.address ?? null),
        rating: r.rating,
      }));

    return NextResponse.json({ testimonials, completedJobs });
  } catch (err: any) {
    logError('[GET /api/home-stats]', err);
    // Never break the landing page — return empty so it uses fallback content.
    return NextResponse.json({ testimonials: [], completedJobs: 0 });
  }
}
