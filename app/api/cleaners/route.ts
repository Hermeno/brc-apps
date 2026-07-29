import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { haversineDistance, resolveCoords, coordsFromZip } from '@/lib/geo';
import { detectServiceKey } from '@/lib/pricing';

const PLAN_BONUS: Record<string, number> = { FREE: 0, BASIC: 15, PRO: 30, PREMIUM: 30 };
const PLAN_MAX_RADIUS: Record<string, number> = { FREE: 60, BASIC: 60, PRO: 110, PREMIUM: 110 };

// Directory ranking — same ingredients as the CFS matching score, kept
// self-contained so the matching engine stays untouched.
function scoreCleaner(plan: string, ratingAvg: number, distanceMiles: number | null): number {
  let score = PLAN_BONUS[plan] ?? 0;         // 0–30
  score += (ratingAvg / 5) * 20;             // 0–20
  if (distanceMiles !== null) score += Math.max(0, 10 - distanceMiles / 5); // 0–10
  return score;
}

// Client-facing directory: verified, available cleaners near the client,
// optionally filtered by service. Returns public-safe fields only.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const me = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, latitude: true, longitude: true, zipCode: true },
    });
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url     = req.nextUrl;
    const zipParam = url.searchParams.get('zip')?.trim() || null;
    const service  = url.searchParams.get('service')?.trim() || null;

    // Where is the client? explicit ?zip overrides their saved location.
    const clientCoords = zipParam
      ? coordsFromZip(zipParam)
      : resolveCoords(me.latitude, me.longitude, me.zipCode);

    const now = new Date();
    const cleaners = await prisma.user.findMany({
      where: {
        role: 'CLEANER', isAvailable: true, isVerified: true,
        hasPaymentMethod: true,
        verification: { status: 'APPROVED' },
        OR: [{ suspendedUntil: null }, { suspendedUntil: { lt: now } }],
      },
      select: {
        id: true, name: true, avatarUrl: true, bio: true, plan: true,
        serviceTypes: true, latitude: true, longitude: true, zipCode: true,
        serviceRadiusMiles: true, createdAt: true,
        stats: { select: { ratingAvg: true, totalLeads: true } },
      },
      take: 200,
    });

    const serviceKey = service ? detectServiceKey(service) : null;

    const rows = cleaners
      .map(c => {
        // Service filter: cleaner must offer it (empty serviceTypes = accepts all)
        if (serviceKey && c.serviceTypes.length > 0) {
          const offered = c.serviceTypes.map(detectServiceKey);
          if (!offered.includes(serviceKey)) return null;
        }

        const coords = resolveCoords(c.latitude, c.longitude, c.zipCode);
        let distanceMiles: number | null = null;
        if (clientCoords && coords) {
          distanceMiles = haversineDistance(clientCoords.lat, clientCoords.lng, coords.lat, coords.lng);
          // Only show cleaners whose service area actually reaches the client.
          const planMax = PLAN_MAX_RADIUS[c.plan ?? 'FREE'] ?? 60;
          const radius  = Math.min(c.serviceRadiusMiles ?? 25, planMax);
          if (distanceMiles > radius) return null;
        }

        return {
          id:        c.id,
          name:      c.name,
          avatarUrl: c.avatarUrl,
          bio:       c.bio,
          plan:      c.plan,
          serviceTypes: c.serviceTypes,
          ratingAvg:    c.stats?.ratingAvg ?? 0,
          totalJobs:    c.stats?.totalLeads ?? 0,
          distanceMiles: distanceMiles !== null ? Math.round(distanceMiles) : null,
          _score: scoreCleaner(c.plan ?? 'FREE', c.stats?.ratingAvg ?? 0, distanceMiles),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...pub }) => pub);

    return NextResponse.json({ cleaners: rows, hasLocation: !!clientCoords });
  } catch (err: any) {
    logError('[GET /api/cleaners]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
