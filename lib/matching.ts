import { prisma } from './prisma';
import { calculateLeadPrice, detectServiceKey, getLeadPriceConfig } from './pricing';
import { createNotificationMany, createNotification } from './notifications';
import { haversineDistance, resolveCoords, ensureRadiusColumn } from './geo';

// ─── CFS (Cleaner Fit Score) ─────────────────────────────────────────────────
// Max 100 points: Plan(30) + Service(40) + Rating(20) + Proximity(10)
//
// Plan tiers:
//   FREE  →  0 pts  | Wave 2+ only      | max radius  25 mi
//   BASIC → 15 pts  | Wave 1 + Wave 2+  | max radius  60 mi
//   PRO   → 30 pts  | Wave 1 + Instant Book | max radius 110 mi

const PLAN_BONUS: Record<string, number> = {
  FREE: 0, BASIC: 15, PRO: 30, PREMIUM: 30,
};

const PLAN_MAX_RADIUS: Record<string, number> = {
  FREE: 25, BASIC: 60, PRO: 110, PREMIUM: 110,
};

function isWave1Eligible(plan: string): boolean {
  return plan === 'BASIC' || plan === 'PRO' || plan === 'PREMIUM';
}

function isInstantBookEligible(plan: string): boolean {
  return plan === 'PRO' || plan === 'PREMIUM';
}

function scoreCFS(cleaner: any, lead: any, distanceMiles: number | null): number {
  const leadKey = detectServiceKey(lead.serviceType);

  // Hard filter: cleaner must offer this service (or accept all)
  if (cleaner.serviceTypes?.length > 0) {
    const cleanerKeys = (cleaner.serviceTypes as string[]).map((t: string) => detectServiceKey(t));
    if (!cleanerKeys.includes(leadKey)) return 0;
  }

  let score = 0;

  // Plan bonus (0–30)
  score += PLAN_BONUS[cleaner.plan ?? 'FREE'] ?? 0;

  // Service match (0–40): explicit list = 40, accepts-all = 20
  score += cleaner.serviceTypes?.length > 0 ? 40 : 20;

  // Rating (0–20)
  const rating: number = cleaner.stats?.ratingAvg ?? 0;
  score += (rating / 5) * 20;

  // Proximity bonus (0–10): 0 mi → 10 pts, 50+ mi → 0 pts
  if (distanceMiles !== null) {
    score += Math.max(0, Math.round(10 - distanceMiles / 5));
  }

  return Math.round(Math.min(100, score));
}

// ─── Radius filter ────────────────────────────────────────────────────────────
function filterByRadius(
  cleaners: any[],
  leadCoords: { lat: number; lng: number } | null,
): { cleaner: any; distanceMiles: number | null }[] {
  return cleaners
    .map(c => {
      const cleanerCoords = resolveCoords(c.latitude, c.longitude, c.zipCode);
      if (!cleanerCoords) return null;                             // cleaner has no location

      const distanceMiles = leadCoords
        ? haversineDistance(cleanerCoords.lat, cleanerCoords.lng, leadCoords.lat, leadCoords.lng)
        : null;

      const planMax     = PLAN_MAX_RADIUS[c.plan ?? 'FREE'] ?? 25;
      const radiusMiles = Math.min(c.serviceRadiusMiles ?? 25, planMax);

      // If lead coords are known, enforce hard distance limit
      if (distanceMiles !== null && distanceMiles > radiusMiles) return null;

      return { cleaner: c, distanceMiles };
    })
    .filter(Boolean) as { cleaner: any; distanceMiles: number | null }[];
}

// ─── Wave timing ──────────────────────────────────────────────────────────────
const WAVE1_WINDOW_MS        =  90 * 1000;   // 90 s  — exclusive hold for top BASIC/PRO
const WAVE2_WINDOW_MS        = 180 * 1000;   // 3 min — two cleaners compete
const WAVE3_WINDOW_MS        = 180 * 1000;   // 3 min — each subsequent batch
const INSTANT_BOOK_WINDOW_MS =  10 * 60 * 1000; // 10 min — PRO instant accept
const WAVE_BATCH_SIZE        = 2;

// ─── Main matching engine ─────────────────────────────────────────────────────

export async function runMatching(leadId: string) {
  await ensureRadiusColumn();

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { type: 'error' };

  const leadCoords = resolveCoords(lead.latitude, lead.longitude, lead.zipCode);

  const now = new Date();
  const cleaners = await prisma.user.findMany({
    where: {
      role: 'CLEANER', isAvailable: true,
      OR: [{ suspendedUntil: null }, { suspendedUntil: { lt: now } }],
    },
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

  const priceConfig = lead.leadPrice == null ? await getLeadPriceConfig() : null;
  const leadPrice   = lead.leadPrice ?? calculateLeadPrice(lead.serviceType, undefined, undefined, priceConfig ?? undefined);

  // ── Instant Book: top PRO cleaner with score ≥ 85 ─────────────────────────
  const top = scored[0];
  if (top.score >= 85 && isInstantBookEligible(top.cleaner.plan ?? 'FREE')) {
    const instantExpiry = new Date(Date.now() + INSTANT_BOOK_WINDOW_MS);
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data:  { status: 'IN_REVIEW', isInstantBook: true, leadPrice },
      }),
      prisma.leadDistribution.create({
        data: {
          leadId, cleanerId: top.cleaner.id,
          wave: 0, status: 'INVITED',
          notifiedAt: new Date(), expiresAt: instantExpiry,
        },
      }),
    ]);

    createNotificationMany([{
      userId: top.cleaner.id,
      type:   'lead_received',
      title:  '⚡ Instant Book — you were matched!',
      body:   `${lead.serviceType} at ${lead.address}. Accept within 10 min.`,
      link:   '/dashboard/cleaner',
    }]).catch(() => {});

    return { type: 'instant', cleanerId: top.cleaner.id, score: top.score, leadPrice };
  }

  // ── Wave 1: top BASIC/PRO cleaner, 90-second exclusive window ─────────────
  const wave1Pool     = scored.filter(s => isWave1Eligible(s.cleaner.plan ?? 'FREE'));
  const wave1Cleaners = wave1Pool.slice(0, 1);

  if (wave1Cleaners.length === 0) {
    // No BASIC/PRO in radius — skip straight to Wave 2 so the lead isn't stuck
    const wave2Pool    = scored.slice(0, WAVE_BATCH_SIZE);
    const wave2Expires = new Date(Date.now() + WAVE2_WINDOW_MS);

    await prisma.lead.update({ where: { id: leadId }, data: { status: 'WAVE2', leadPrice } });
    await prisma.leadDistribution.createMany({
      data: wave2Pool.map(({ cleaner }) => ({
        leadId, cleanerId: cleaner.id,
        wave: 2, status: 'INVITED',
        notifiedAt: new Date(), expiresAt: wave2Expires,
      })),
      skipDuplicates: true,
    });

    createNotificationMany(wave2Pool.map(({ cleaner }) => ({
      userId: cleaner.id,
      type:   'lead_received',
      title:  'New lead available!',
      body:   `${lead.serviceType} at ${lead.address}. Be the first to accept!`,
      link:   '/dashboard/cleaner',
    }))).catch(() => {});

    return { type: 'wave2_direct', cleanerIds: wave2Pool.map(c => c.cleaner.id), leadPrice };
  }

  const wave1Expires = new Date(Date.now() + WAVE1_WINDOW_MS);

  await prisma.lead.update({ where: { id: leadId }, data: { status: 'WAVE1', leadPrice } });
  await prisma.leadDistribution.createMany({
    data: wave1Cleaners.map(({ cleaner }) => ({
      leadId, cleanerId: cleaner.id,
      wave: 1, status: 'INVITED',
      notifiedAt: new Date(), expiresAt: wave1Expires,
    })),
    skipDuplicates: true,
  });

  createNotificationMany(wave1Cleaners.map(({ cleaner }) => ({
    userId: cleaner.id,
    type:   'lead_received',
    title:  'New lead — exclusive access!',
    body:   `${lead.serviceType} at ${lead.address}. You have 90 seconds.`,
    link:   '/dashboard/cleaner',
  }))).catch(() => {});

  return { type: 'wave1', cleanerIds: wave1Cleaners.map(c => c.cleaner.id) };
}

// ─── Next-batch helper ────────────────────────────────────────────────────────
// Finds the next 2 cleaners not yet tried, invites them, and sets the lead status.
// If no more cleaners remain in radius → marks lead UNMATCHED.
// Returns true if a new batch was dispatched, false if UNMATCHED.
async function dispatchNextBatch(
  lead: { id: string; latitude: number; longitude: number; zipCode: string | null; serviceType: string; address: string; distributions: { cleanerId: string }[] },
  nowDate: Date,
  nextStatus: 'WAVE2' | 'WAVE3',
  windowMs: number,
): Promise<boolean> {
  const leadCoords = resolveCoords(lead.latitude, lead.longitude, lead.zipCode);
  const usedIds    = lead.distributions.map(d => d.cleanerId);

  const candidates = await prisma.user.findMany({
    where: {
      role: 'CLEANER', isAvailable: true,
      id:  { notIn: usedIds },
      OR:  [{ suspendedUntil: null }, { suspendedUntil: { lt: nowDate } }],
    },
    include: { stats: true },
    take: 100,
  });

  const inRadius = filterByRadius(candidates, leadCoords);
  const scored   = inRadius
    .map(({ cleaner, distanceMiles }) => ({ cleaner, score: scoreCFS(cleaner, lead, distanceMiles) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, WAVE_BATCH_SIZE);

  if (scored.length === 0) {
    await prisma.lead.update({ where: { id: lead.id }, data: { status: 'UNMATCHED' } });
    return false;
  }

  const nextExpiry = new Date(nowDate.getTime() + windowMs);
  const waveNum    = nextStatus === 'WAVE2' ? 2 : 3;

  await prisma.lead.update({ where: { id: lead.id }, data: { status: nextStatus } });
  await prisma.leadDistribution.createMany({
    data: scored.map(({ cleaner }) => ({
      leadId:     lead.id,
      cleanerId:  cleaner.id,
      wave:       waveNum,
      status:     'INVITED',
      notifiedAt: nowDate,
      expiresAt:  nextExpiry,
    })),
    skipDuplicates: true,
  });

  createNotificationMany(scored.map(({ cleaner }) => ({
    userId: cleaner.id,
    type:   'lead_received',
    title:  'New lead available!',
    body:   `${lead.serviceType} at ${lead.address}. Be the first to accept!`,
    link:   '/dashboard/cleaner',
  }))).catch(() => {});

  return true;
}

// ─── Wave advancement (called by cron every minute) ───────────────────────────
// Returns leadIds that need runMatching called after the cron response — the
// caller (cron handler) wraps them in after() since after() only works in route handlers.

export async function advanceWaves(): Promise<string[]> {
  await ensureRadiusColumn();
  const nowDate = new Date();
  const rematchIds: string[] = [];

  // ── Instant Book expiry → UNMATCHED ──────────────────────────────────────
  const expiredInstant = await prisma.lead.findMany({
    where: {
      status:        'IN_REVIEW',
      isInstantBook: true,
      conversations: { none: {} },
      distributions: { some: { wave: 0, status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
  });
  for (const lead of expiredInstant) {
    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, wave: 0, status: 'INVITED' },
      data:  { status: 'EXPIRED' },
    });
    await prisma.lead.update({
      where: { id: lead.id },
      data:  { status: 'UNMATCHED', isInstantBook: false },
    });
  }

  // ── Wave 1 expiry → Wave 2 ────────────────────────────────────────────────
  const expiredWave1 = await prisma.lead.findMany({
    where: {
      status:        'WAVE1',
      distributions: { some: { wave: 1, status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: true },
  });

  for (const lead of expiredWave1) {
    // Skip if any Wave 1 cleaner already accepted (race window protection)
    if (lead.distributions.some(d => d.wave === 1 && d.status === 'ACCEPTED')) continue;

    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, wave: 1, status: 'INVITED' },
      data:  { status: 'EXPIRED' },
    });

    await dispatchNextBatch(lead, nowDate, 'WAVE2', WAVE2_WINDOW_MS);
  }

  // ── Wave 2 expiry → Wave 3 (first extended round) ─────────────────────────
  const expiredWave2 = await prisma.lead.findMany({
    where: {
      status:        'WAVE2',
      distributions: { some: { wave: 2, status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: true },
  });

  for (const lead of expiredWave2) {
    if (lead.distributions.some(d => d.wave === 2 && d.status === 'ACCEPTED')) continue;

    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, wave: 2, status: 'INVITED' },
      data:  { status: 'EXPIRED' },
    });

    await dispatchNextBatch(lead, nowDate, 'WAVE3', WAVE3_WINDOW_MS);
  }

  // ── Wave 3 cycling → next batch or UNMATCHED ─────────────────────────────
  // WAVE3 is the "extended matching" state — it keeps cycling through fresh
  // batches of 2 cleaners until the full radius is exhausted, then UNMATCHED.
  const expiredWave3 = await prisma.lead.findMany({
    where: {
      status:        'WAVE3',
      distributions: { some: { status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: true },
  });

  for (const lead of expiredWave3) {
    // Skip if any invited cleaner just accepted before cron ran
    if (lead.distributions.some(d => d.status === 'ACCEPTED')) continue;

    // Expire the current batch of INVITED dists that have passed their deadline
    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, status: 'INVITED', expiresAt: { lt: nowDate } },
      data:  { status: 'EXPIRED' },
    });

    // Try to find the next unused batch — stays WAVE3 or becomes UNMATCHED
    await dispatchNextBatch(lead, nowDate, 'WAVE3', WAVE3_WINDOW_MS);
  }

  // ── Fee deadline expiry — re-match unpaid acceptances ─────────────────────
  const unpaidConvs = await prisma.conversation.findMany({
    where: {
      status:      'active',
      feeStatus:   'pending',
      feeDeadline: { lt: nowDate },
    },
    select: { id: true, leadId: true, cleanerId: true, clientId: true },
  });

  for (const conv of unpaidConvs) {
    await prisma.conversation.update({
      where: { id: conv.id },
      data:  { status: 'declined', feeStatus: 'waived', feeDeadline: null },
    });

    createNotification({
      userId: conv.cleanerId,
      type:   'payment_failed',
      title:  'Lead released — fee not paid',
      body:   'You did not pay the lead fee within 24 hours. The lead has been released.',
      link:   '/dashboard/cleaner',
    }).catch(() => {});

    const remaining = await prisma.conversation.count({
      where: { leadId: conv.leadId, status: 'active', id: { not: conv.id } },
    });

    if (remaining === 0) {
      await prisma.$transaction([
        prisma.lead.update({
          where: { id: conv.leadId },
          data:  { status: 'NEW', cleanerId: null },
        }),
        prisma.leadDistribution.updateMany({
          where: { leadId: conv.leadId, status: 'INVITED' },
          data:  { status: 'EXPIRED' },
        }),
      ]);

      createNotification({
        userId: conv.clientId,
        type:   'lead_unmatched',
        title:  'Looking for a new cleaner',
        body:   'The previous cleaner did not confirm in time. Finding a new match.',
        link:   '/dashboard/client',
      }).catch(() => {});

      // Collected — caller wraps in after() so it runs post-response
      rematchIds.push(conv.leadId);
    }
  }

  return rematchIds;
}
