import { prisma } from './prisma';
import { calculateLeadPrice, detectServiceKey, getLeadPriceConfig } from './pricing';
import { createNotificationMany } from './notifications';
import { haversineDistance, resolveCoords, ensureRadiusColumn } from './geo';

// ─── advanceWaves rate-limiter ────────────────────────────────────────────────
let lastAdvanceAt = 0;
const ADVANCE_COOLDOWN_MS = 60_000;

// ─── CFS (Cleaner Ranking Score) ─────────────────────────────────────────────
// Max 100 points: Plan(30) + Service(40) + Rating(20) + Proximity(10)

const PLAN_BONUS: Record<string, number> = {
  FREE: 0, BASIC: 10, PREMIUM: 20, PRO: 30,
};

function scoreCFS(cleaner: any, lead: any, distanceMiles: number | null): number {
  const leadKey = detectServiceKey(lead.serviceType);

  // Hard filter — cleaner must offer this service (or accept all).
  if (cleaner.serviceTypes?.length > 0) {
    const cleanerKeys = (cleaner.serviceTypes as string[]).map((t: string) => detectServiceKey(t));
    if (!cleanerKeys.includes(leadKey)) return 0;
  }

  let score = 0;

  // Plan bonus (0–30)
  score += PLAN_BONUS[cleaner.plan ?? 'FREE'] ?? 0;

  // Service match (0–40): exact = 40, accepts-all = 20
  score += cleaner.serviceTypes?.length > 0 ? 40 : 20;

  // Rating (0–20)
  const rating: number = cleaner.stats?.ratingAvg ?? 0;
  score += (rating / 5) * 20;

  // Proximity bonus (0–10): closer = more points
  // 0 miles → 10 pts, 10 miles → 8 pts, 25 miles → 5 pts, 50+ miles → 0 pts
  if (distanceMiles !== null) {
    const proximityPts = Math.max(0, 10 - (distanceMiles / 5));
    score += Math.round(proximityPts);
  }

  return Math.round(Math.min(100, score));
}

// Filter cleaners by their configured service radius and return enriched list
function filterByRadius(cleaners: any[], leadCoords: { lat: number; lng: number } | null) {
  return cleaners
    .map(c => {
      const cleanerCoords = resolveCoords(c.latitude, c.longitude, c.zipCode);
      const distanceMiles = (leadCoords && cleanerCoords)
        ? haversineDistance(cleanerCoords.lat, cleanerCoords.lng, leadCoords.lat, leadCoords.lng)
        : null;

      const radiusMiles: number = c.serviceRadiusMiles ?? 25;

      // Hard distance filter — only skip if BOTH have coordinates AND distance exceeds radius
      if (distanceMiles !== null && distanceMiles > radiusMiles) return null;

      return { cleaner: c, distanceMiles };
    })
    .filter(Boolean) as { cleaner: any; distanceMiles: number | null }[];
}

// ─── Wave timing constants ────────────────────────────────────────────────────

const WAVE1_WINDOW_MS = 90 * 1000;   // 90 seconds
const WAVE2_WINDOW_MS = 180 * 1000;  // 180 seconds

// ─── Main matching engine ─────────────────────────────────────────────────────

export async function runMatching(leadId: string) {
  await ensureRadiusColumn();

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { type: 'error' };

  // Resolve lead coordinates from stored lat/lng or ZIP centroid
  const leadCoords = resolveCoords(
    lead.latitude !== 0 ? lead.latitude : null,
    lead.longitude !== 0 ? lead.longitude : null,
    lead.zipCode,
  );

  const cleaners = await prisma.user.findMany({
    where: { role: 'CLEANER', isAvailable: true, isVerified: true },
    include: { stats: true },
    take: 200,
  });

  if (cleaners.length === 0) {
    await prisma.lead.update({ where: { id: leadId }, data: { status: 'UNMATCHED' } });
    return { type: 'unmatched' };
  }

  const inRadius = filterByRadius(cleaners, leadCoords);

  const scored = inRadius
    .map(({ cleaner, distanceMiles }) => ({
      cleaner,
      score: scoreCFS(cleaner, lead, distanceMiles),
      distanceMiles,
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    await prisma.lead.update({ where: { id: leadId }, data: { status: 'UNMATCHED' } });
    return { type: 'unmatched' };
  }

  // Use stored price (set at lead creation) or recalculate
  const priceConfig = lead.leadPrice == null ? await getLeadPriceConfig() : null;
  const leadPrice = lead.leadPrice ?? calculateLeadPrice(
    lead.serviceType, lead.dateTime, lead.frequency, priceConfig ?? undefined,
  );

  // ── Instant Book: top cleaner scores ≥ 85 ──────────────────────────────────
  const top = scored[0];
  if (top.score >= 85) {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { status: 'ACCEPTED', cleanerId: top.cleaner.id, isInstantBook: true, leadPrice },
      }),
      prisma.conversation.create({
        data: { leadId, clientId: lead.clientId, cleanerId: top.cleaner.id, leadFee: leadPrice, feeStatus: 'charged' },
      }),
      prisma.leadDistribution.create({
        data: { leadId, cleanerId: top.cleaner.id, wave: 0, status: 'ACCEPTED', notifiedAt: new Date(), respondedAt: new Date() },
      }),
      prisma.cleanerStats.upsert({
        where: { cleanerId: top.cleaner.id },
        create: { cleanerId: top.cleaner.id, totalLeads: 1 },
        update: { totalLeads: { increment: 1 } },
      }),
    ]);
    return { type: 'instant', cleanerId: top.cleaner.id, score: top.score, leadPrice };
  }

  // ── Wave 1: top 2 cleaners, 90-second exclusive window ──────────────────────
  const wave1Cleaners = scored.slice(0, 2);
  const wave1Expires  = new Date(Date.now() + WAVE1_WINDOW_MS);

  await prisma.lead.update({ where: { id: leadId }, data: { status: 'WAVE1', leadPrice } });
  await prisma.leadDistribution.createMany({
    data: wave1Cleaners.map(({ cleaner }) => ({
      leadId,
      cleanerId:  cleaner.id,
      wave:       1,
      status:     'INVITED',
      notifiedAt: new Date(),
      expiresAt:  wave1Expires,
    })),
    skipDuplicates: true,
  });

  createNotificationMany(wave1Cleaners.map(({ cleaner }) => ({
    userId: cleaner.id,
    type:   'lead_received',
    title:  'New lead available!',
    body:   `${lead.serviceType} at ${lead.address}. You have 90 seconds.`,
    link:   '/dashboard/marketplace',
  }))).catch(() => {});

  return { type: 'wave1', cleanerIds: wave1Cleaners.map(c => c.cleaner.id) };
}

// ─── Wave advancement ─────────────────────────────────────────────────────────

export async function advanceWaves() {
  const now = Date.now();
  if (now - lastAdvanceAt < ADVANCE_COOLDOWN_MS) return;
  lastAdvanceAt = now;

  await ensureRadiusColumn();
  const nowDate = new Date();

  // ── Wave 1 → Wave 2 ────────────────────────────────────────────────────────
  const expiredWave1 = await prisma.lead.findMany({
    where: {
      status: 'WAVE1',
      distributions: { some: { wave: 1, status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: true },
  });

  for (const lead of expiredWave1) {
    const w1 = lead.distributions.filter(d => d.wave === 1);
    if (w1.some(d => d.status === 'ACCEPTED')) continue;

    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, wave: 1, status: 'INVITED' },
      data:  { status: 'EXPIRED' },
    });

    const leadCoords = resolveCoords(
      lead.latitude !== 0 ? lead.latitude : null,
      lead.longitude !== 0 ? lead.longitude : null,
      lead.zipCode,
    );

    const usedIds       = lead.distributions.map(d => d.cleanerId);
    const wave2Candidates = await prisma.user.findMany({
      where:   { role: 'CLEANER', isAvailable: true, isVerified: true, id: { notIn: usedIds } },
      include: { stats: true },
      take:    50,
    });

    const inRadius = filterByRadius(wave2Candidates, leadCoords);
    const scored = inRadius
      .map(({ cleaner, distanceMiles }) => ({
        cleaner,
        score: scoreCFS(cleaner, lead, distanceMiles),
      }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (scored.length === 0) {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'UNMATCHED' } });
      continue;
    }

    const wave2Expires = new Date(Date.now() + WAVE2_WINDOW_MS);
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'WAVE2' } });
    await prisma.leadDistribution.createMany({
      data: scored.map(({ cleaner }) => ({
        leadId:     lead.id,
        cleanerId:  cleaner.id,
        wave:       2,
        status:     'INVITED',
        expiresAt:  wave2Expires,
        notifiedAt: nowDate,
      })),
      skipDuplicates: true,
    });

    createNotificationMany(scored.map(({ cleaner }) => ({
      userId: cleaner.id,
      type:   'lead_received',
      title:  'New lead available!',
      body:   `${lead.serviceType} at ${lead.address}. Be the first to accept!`,
      link:   '/dashboard/marketplace',
    }))).catch(() => {});
  }

  // ── Wave 2 expiry → UNMATCHED ──────────────────────────────────────────────
  const expiredWave2 = await prisma.lead.findMany({
    where: {
      status: 'WAVE2',
      distributions: { some: { wave: 2, status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: { where: { wave: 2 } } },
  });

  for (const lead of expiredWave2) {
    if (lead.distributions.some(d => d.status === 'ACCEPTED')) continue;

    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, wave: 2, status: 'INVITED' },
      data:  { status: 'EXPIRED' },
    });
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'UNMATCHED' } });
  }
}
