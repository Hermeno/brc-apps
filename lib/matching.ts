import { prisma } from './prisma';
import { calculateLeadPrice, detectServiceKey, getLeadPriceConfig } from './pricing';
import { createNotificationMany, createNotification } from './notifications';
import { haversineDistance, resolveCoords, ensureRadiusColumn } from './geo';
import { PLAN_MAX_RADIUS, DEFAULT_RADIUS_MILES } from './plans';
import { logWarn } from './logger';
import { resolveFeeOnCancellation } from './lead-fee';
import { DIRECT_REQUEST_HOURS, CLIENT_DECISION_HOURS, AUTO_COMPLETE_HOURS } from './lead-policy';

// ─── CFS (Cleaner Fit Score) ─────────────────────────────────────────────────
// Max 100 points: Plan(30) + Service(40) + Rating(20) + Proximity(10)
//
// Plan tiers:
//   FREE  →  0 pts  | max radius  60 mi
//   BASIC → 15 pts  | max radius  60 mi
//   PRO   → 30 pts  | Instant Book eligible | max radius 110 mi

const PLAN_BONUS: Record<string, number> = {
  FREE: 0, BASIC: 15, PRO: 30, PREMIUM: 30,
};

// PLAN_MAX_RADIUS + DEFAULT_RADIUS_MILES come from lib/plans.ts (single source of truth).

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

type ScoredCleaner = { cleaner: any; distanceMiles: number | null };

type RadiusOutcome = {
  kept: ScoredCleaner[];
  /** Cleaners with neither GPS nor a resolvable ZIP — distance can't be measured. */
  noCoords: { id: string; zipCode: string | null }[];
  outOfRadius: { id: string; distanceMiles: number; radiusMiles: number }[];
};

function filterByRadius(
  cleaners: any[],
  leadCoords: { lat: number; lng: number } | null,
): RadiusOutcome {
  const outcome: RadiusOutcome = { kept: [], noCoords: [], outOfRadius: [] };

  for (const c of cleaners) {
    const cleanerCoords = resolveCoords(c.latitude, c.longitude, c.zipCode);
    if (!cleanerCoords) {
      // Recorded rather than silently dropped: this state used to starve a
      // cleaner of every lead with nothing anywhere to say why.
      outcome.noCoords.push({ id: c.id, zipCode: c.zipCode ?? null });
      continue;
    }

    const distanceMiles = leadCoords
      ? haversineDistance(cleanerCoords.lat, cleanerCoords.lng, leadCoords.lat, leadCoords.lng)
      : null;

    const planMax     = PLAN_MAX_RADIUS[c.plan ?? 'FREE'] ?? PLAN_MAX_RADIUS.FREE;
    const radiusMiles = Math.min(c.serviceRadiusMiles ?? DEFAULT_RADIUS_MILES, planMax);

    // Enforce the cleaner's chosen radius when distance is known. If the lead
    // has no resolvable coordinates (distanceMiles null), distance can't be
    // measured — we keep the cleaner as a fallback so the lead still matches.
    if (distanceMiles !== null && distanceMiles > radiusMiles) {
      outcome.outOfRadius.push({ id: c.id, distanceMiles: Math.round(distanceMiles), radiusMiles });
      continue;
    }

    outcome.kept.push({ cleaner: c, distanceMiles });
  }

  return outcome;
}

/**
 * Explains why a lead reached nobody, one gate at a time.
 *
 * A lead going UNMATCHED is otherwise indistinguishable from a lead nobody
 * wanted, which is what made the last failure impossible to diagnose: the
 * cleaners were inside the radius, but an earlier gate had already removed them.
 * Written to AppLog so it shows up in the admin panel.
 */
async function logNoMatch(
  lead: { id: string; address: string; zipCode: string | null; serviceType: string },
  leadCoords: { lat: number; lng: number } | null,
  eligible: any[],
  radius: RadiusOutcome,
  serviceMismatch: number,
  nowDate: Date,
): Promise<void> {
  const availability = await prisma.user.groupBy({
    by:    ['isAvailable', 'isVerified', 'hasPaymentMethod'],
    where: { role: 'CLEANER', deletedAt: null },
    _count: { _all: true },
  }).catch(() => null);

  const nearestMiss = radius.outOfRadius
    .slice()
    .sort((a, b) => a.distanceMiles - b.distanceMiles)[0] ?? null;

  logWarn('[matching]', 'lead matched no cleaner', {
    leadId:      lead.id,
    address:     lead.address,
    zipCode:     lead.zipCode,
    serviceType: lead.serviceType,
    leadCoords,
    // Cleaners left after the DB gates (available + verified + approved + card).
    eligible:              eligible.length,
    droppedNoCoords:       radius.noCoords.length,
    droppedOutOfRadius:    radius.outOfRadius.length,
    droppedServiceMismatch: serviceMismatch,
    nearestMiss,
    cleanersWithoutCoords: radius.noCoords.slice(0, 5),
    // Whole-population counts, so a zero here shows the gate that emptied the pool.
    population: availability,
    at: nowDate.toISOString(),
  });
}

// ─── Timing ───────────────────────────────────────────────────────────────────
// Each batch of 2 cleaners gets 90 seconds to accept before the next batch is tried.
const WAVE_BATCH_SIZE      = 2;
const OPEN_WINDOW_MS       = 90 * 1000;
const INSTANT_BOOK_WINDOW_MS = 10 * 60 * 1000;
const HOUR_MS                = 60 * 60 * 1000;

// ─── Direct request ───────────────────────────────────────────────────────────
// Client picked a specific cleaner (Thumbtack-style). Instead of the wave
// auto-dispatch, send the lead straight to that cleaner and let it wait for
// them. The lead is left in status NEW — which advanceWaves never touches, so
// it is never hijacked into the auto-wave and re-sent to random cleaners — but
// with an INVITED distribution it still surfaces in the cleaner's feed and the
// normal /respond flow (which charges the lead fee on accept) works unchanged.
// expiresAt is null so the cleaner sees no misleading 90-second countdown.
// Returns false if the target isn't a valid, verified cleaner.
export async function dispatchDirect(leadId: string, cleanerId: string): Promise<boolean> {
  const cleaner = await prisma.user.findFirst({
    where: { id: cleanerId, role: 'CLEANER', isVerified: true },
    select: { id: true },
  });
  if (!cleaner) return false;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { serviceType: true, address: true },
  });
  if (!lead) return false;

  // Leave lead.status as 'NEW' (its creation default) so advanceWaves ignores it.
  await prisma.leadDistribution.create({
    data: {
      leadId, cleanerId,
      wave: 2, status: 'INVITED',
      notifiedAt: new Date(), expiresAt: null,
    },
  });

  createNotificationMany([{
    userId: cleanerId,
    type:   'lead_received',
    title:  '✋ A client requested you directly!',
    body:   `${lead.serviceType} at ${lead.address}. Respond to start the conversation.`,
    link:   '/dashboard/cleaner',
  }]).catch(() => {});

  return true;
}

// ─── Main matching engine ─────────────────────────────────────────────────────
// Sends the lead to the top 2 scored cleaners (WAVE2). If they don't respond
// within 90 sec, advanceWaves picks the next batch of 2 (WAVE3, cycling).

export async function runMatching(leadId: string) {
  await ensureRadiusColumn();

  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { distributions: true } });
  if (!lead) return { type: 'error' };

  // A re-match (after a decline or an unpaid fee) keeps its invite history: new
  // cleaners first, never again the one who already answered. Starting over here
  // collided with that history and could leave the lead stuck in NEW or WAVE2.
  if (lead.distributions.length > 0) {
    return { type: (await dispatchNextBatch(lead, new Date(), 'WAVE2', OPEN_WINDOW_MS)) ? 'wave2' : 'unmatched' };
  }

  const leadCoords = resolveCoords(lead.latitude, lead.longitude, lead.zipCode);

  const now = new Date();
  const cleaners = await prisma.user.findMany({
    where: {
      role: 'CLEANER', isAvailable: true, isVerified: true,
      hasPaymentMethod: true,
      verification: { status: 'APPROVED' },
      OR: [{ suspendedUntil: null }, { suspendedUntil: { lt: now } }],
    },
    include: { stats: true },
    take: 200,
  });

  const radius = filterByRadius(cleaners, leadCoords);
  const scored = radius.kept
    .map(({ cleaner, distanceMiles }) => ({
      cleaner,
      score: scoreCFS(cleaner, lead, distanceMiles),
      distanceMiles,
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    await logNoMatch(
      lead, leadCoords, cleaners, radius,
      radius.kept.length - scored.length, now,
    );
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
      body:   `${lead.serviceType} at ${lead.address}. Accept within ${INSTANT_BOOK_WINDOW_MS / 60000} minutes.`,
      link:   '/dashboard/cleaner',
    }]).catch(() => {});

    return { type: 'instant', cleanerId: top.cleaner.id, score: top.score, leadPrice };
  }

  // ── Wave 2: send to top 2 cleaners ────────────────────────────────────────
  const batch   = scored.slice(0, WAVE_BATCH_SIZE);
  const expires = new Date(Date.now() + OPEN_WINDOW_MS);

  await prisma.lead.update({ where: { id: leadId }, data: { status: 'WAVE2', leadPrice } });
  await prisma.leadDistribution.createMany({
    data: batch.map(({ cleaner }) => ({
      leadId, cleanerId: cleaner.id,
      wave: 2, status: 'INVITED',
      notifiedAt: new Date(), expiresAt: expires,
    })),
    skipDuplicates: true,
  });

  createNotificationMany(batch.map(({ cleaner }) => ({
    userId: cleaner.id,
    type:   'lead_received',
    title:  'New lead available!',
    body:   `${lead.serviceType} at ${lead.address}. Be the first to respond!`,
    link:   '/dashboard/cleaner',
  }))).catch(() => {});

  return { type: 'wave2', cleanerIds: batch.map(s => s.cleaner.id), leadPrice };
}

// ─── Next-batch helper ────────────────────────────────────────────────────────
// Finds the next 2 cleaners not yet invited. Marks previous batch EXPIRED first.
// If no candidates remain → UNMATCHED.
async function dispatchNextBatch(
  lead: {
    id: string; clientId: string; latitude: number; longitude: number; zipCode: string | null; serviceType: string; address: string;
    distributions: { cleanerId: string; status: string; createdAt: Date; notifiedAt: Date | null }[];
  },
  nowDate: Date,
  nextStatus: 'WAVE2' | 'WAVE3',
  windowMs: number,
): Promise<boolean> {
  const leadCoords = resolveCoords(lead.latitude, lead.longitude, lead.zipCode);
  const usedIds    = lead.distributions.map(d => d.cleanerId);
  // One second chance per cleaner, never for the one who already answered (turned
  // down, or let the fee lapse). Uncapped, the same two cleaners were re-notified
  // every 90 seconds until the job date and the client never heard "no match".
  const retryIds   = lead.distributions
    .filter(d => d.status !== 'ACCEPTED' && !(d.notifiedAt && d.notifiedAt.getTime() - d.createdAt.getTime() >= OPEN_WINDOW_MS))
    .map(d => d.cleanerId);

  const candidates = await prisma.user.findMany({
    where: {
      role: 'CLEANER', isAvailable: true, isVerified: true,
      hasPaymentMethod: true,
      verification: { status: 'APPROVED' },
      id:  { notIn: usedIds },
      OR:  [{ suspendedUntil: null }, { suspendedUntil: { lt: nowDate } }],
    },
    include: { stats: true },
    take: 200,
  });

  const radius = filterByRadius(candidates, leadCoords);
  const fit    = radius.kept
    .map(({ cleaner, distanceMiles }) => ({ cleaner, score: scoreCFS(cleaner, lead, distanceMiles) }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
  const scored = fit.slice(0, WAVE_BATCH_SIZE);

  if (scored.length === 0) {
    // No new candidates — cycle back through previously invited cleaners if any are still available
    const recycled = await prisma.user.findMany({
      where: {
        id: { in: retryIds },
        role: 'CLEANER', isAvailable: true, isVerified: true,
        hasPaymentMethod: true,
        verification: { status: 'APPROVED' },
        OR: [{ suspendedUntil: null }, { suspendedUntil: { lt: nowDate } }],
      },
      include: { stats: true },
    });
    const recycledRadius = filterByRadius(recycled, leadCoords);
    const recycledFit    = recycledRadius.kept
      .map(({ cleaner, distanceMiles }) => ({ cleaner, score: scoreCFS(cleaner, lead, distanceMiles) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
    const recycledScored = recycledFit.slice(0, WAVE_BATCH_SIZE);

    if (recycledScored.length === 0) {
      // Both pools are exhausted, so report them together — the lead is about to
      // go UNMATCHED and this is the only record of why.
      await logNoMatch(
        lead, leadCoords, [...candidates, ...recycled],
        {
          kept:        [...radius.kept, ...recycledRadius.kept],
          noCoords:    [...radius.noCoords, ...recycledRadius.noCoords],
          outOfRadius: [...radius.outOfRadius, ...recycledRadius.outOfRadius],
        },
        (radius.kept.length - fit.length) + (recycledRadius.kept.length - recycledFit.length),
        nowDate,
      );
      await prisma.lead.update({ where: { id: lead.id }, data: { status: 'UNMATCHED' } });
      createNotification({
        userId: lead.clientId,
        type:   'lead_unmatched',
        title:  'No cleaner available',
        body:   'None of the nearby cleaners accepted your request. Pick another time, or choose a cleaner directly.',
        link:   '/dashboard/client',
      }).catch(() => {});
      return false;
    }

    const cycleExpiry = new Date(nowDate.getTime() + windowMs);
    await prisma.lead.update({ where: { id: lead.id }, data: { status: nextStatus } });
    await Promise.all(recycledScored.map(({ cleaner }) =>
      prisma.leadDistribution.update({
        where: { leadId_cleanerId: { leadId: lead.id, cleanerId: cleaner.id } },
        data:  { status: 'INVITED', wave: nextStatus === 'WAVE2' ? 2 : 3, notifiedAt: nowDate, expiresAt: cycleExpiry },
      })
    ));
    createNotificationMany(recycledScored.map(({ cleaner }) => ({
      userId: cleaner.id, type: 'lead_received' as const,
      title: 'New lead available!',
      body:  `${lead.serviceType} at ${lead.address}. Be the first to respond!`,
      link:  '/dashboard/cleaner',
    }))).catch(() => {});
    return true;
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
    body:   `${lead.serviceType} at ${lead.address}. Be the first to respond!`,
    link:   '/dashboard/cleaner',
  }))).catch(() => {});

  return true;
}

// ─── Wave advancement (called by cron every minute) ───────────────────────────
export async function advanceWaves(): Promise<string[]> {
  await ensureRadiusColumn();
  const nowDate = new Date();
  const rematchIds: string[] = [];

  // ── Instant Book expiry → back into the normal wave ──────────────────────
  // This used to jump straight to UNMATCHED, which made Instant Book the worst
  // outcome a lead could get: the single best-scored cleaner sat on it, and if
  // they never opened the app the lead died without being offered to anyone
  // else. It now falls back to the ordinary batch of two, exactly like a Wave2
  // that nobody answered. dispatchNextBatch still sets UNMATCHED by itself when
  // there is genuinely no one left — but only after trying.
  const expiredInstant = await prisma.lead.findMany({
    where: {
      status:        'IN_REVIEW',
      isInstantBook: true,
      conversations: { none: {} },
      distributions: { some: { wave: 0, status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: true },
  });
  for (const lead of expiredInstant) {
    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, wave: 0, status: 'INVITED' },
      data:  { status: 'EXPIRED' },
    });
    // Clear the flag first: the lead is no longer an Instant Book, and leaving
    // it set would keep matching this query on the next tick.
    await prisma.lead.update({ where: { id: lead.id }, data: { isInstantBook: false } });

    await dispatchNextBatch(lead, nowDate, 'WAVE2', OPEN_WINDOW_MS);
  }

  // ── Wave 2 expiry → Wave 3 (next batch of 2) ─────────────────────────────
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

    await dispatchNextBatch(lead, nowDate, 'WAVE3', OPEN_WINDOW_MS);
  }

  // ── Wave 3 cycling → next batch of 2 or UNMATCHED ────────────────────────
  const expiredWave3 = await prisma.lead.findMany({
    where: {
      status:        'WAVE3',
      distributions: { some: { status: 'INVITED', expiresAt: { lt: nowDate } } },
    },
    include: { distributions: true },
  });

  for (const lead of expiredWave3) {
    if (lead.distributions.some(d => d.status === 'ACCEPTED')) continue;

    await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, status: 'INVITED', expiresAt: { lt: nowDate } },
      data:  { status: 'EXPIRED' },
    });

    await dispatchNextBatch(lead, nowDate, 'WAVE3', OPEN_WINDOW_MS);
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

      rematchIds.push(conv.leadId);
    }
  }

  // ── Nobody waits forever: deadlines from lib/lead-policy.ts ──────────────

  // A cleaner the client picked directly never answered → offer it to the others.
  const unansweredDirect = await prisma.lead.findMany({
    where: {
      status:        'NEW',
      dateTime:      { gt: nowDate },
      distributions: { some: { status: 'INVITED', expiresAt: null, notifiedAt: { lt: new Date(nowDate.getTime() - DIRECT_REQUEST_HOURS * HOUR_MS) } } },
    },
    include: { distributions: true },
  });
  for (const lead of unansweredDirect) {
    const expired = await prisma.leadDistribution.updateMany({
      where: { leadId: lead.id, status: 'INVITED', expiresAt: null },
      data:  { status: 'EXPIRED' },
    });
    if (expired.count === 0) continue; // another instance handled it
    if (await dispatchNextBatch(lead, nowDate, 'WAVE2', OPEN_WINDOW_MS)) {
      createNotification({
        userId: lead.clientId,
        type:   'lead_unmatched',
        title:  'Offering your request to other cleaners',
        body:   `The cleaner you chose did not answer within ${DIRECT_REQUEST_HOURS} hours, so other cleaners nearby can take it now.`,
        link:   '/dashboard/client',
      }).catch(() => {});
    }
  }

  // A cleaner answered but the client never accepted or declined. The cleaner was
  // held (and their calendar blocked around the job) for as long as the client
  // stayed silent: release them and close the request. Nothing was charged yet.
  const undecided = await prisma.conversation.findMany({
    where: {
      status: 'active',
      lead:   { status: 'IN_REVIEW' },
      OR: [
        { createdAt: { lt: new Date(nowDate.getTime() - CLIENT_DECISION_HOURS * HOUR_MS) } },
        { lead: { dateTime: { lt: nowDate } } },
      ],
    },
    select: { id: true, leadId: true, cleanerId: true, clientId: true, feeStatus: true },
  });
  for (const conv of undecided) {
    const closed = await prisma.conversation.updateMany({
      where: { id: conv.id, status: 'active' },
      data:  { status: 'closed', feeStatus: resolveFeeOnCancellation(conv.feeStatus).feeStatus },
    });
    if (closed.count === 0) continue;
    await prisma.lead.updateMany({ where: { id: conv.leadId, status: 'IN_REVIEW' }, data: { status: 'CANCELLED' } });
    createNotification({
      userId: conv.cleanerId,
      type:   'lead_declined',
      title:  'You are free to take other jobs',
      body:   'The client did not accept or decline in time, so the request was closed. No lead fee was charged.',
      link:   '/dashboard/cleaner',
    }).catch(() => {});
    createNotification({
      userId: conv.clientId,
      type:   'lead_unmatched',
      title:  'Your request was closed',
      body:   'A cleaner was ready, but you did not accept or decline in time, so they were released. You can reactivate the request from your dashboard.',
      link:   '/dashboard/client',
    }).catch(() => {});
  }

  // Still open when the job time arrives → closed; matching a past date is pointless.
  const OPEN = ['NEW', 'WAVE2', 'WAVE3', 'IN_REVIEW'] as const;
  const lapsed = await prisma.lead.findMany({
    where:  { status: { in: [...OPEN] }, dateTime: { lt: nowDate }, conversations: { none: { status: 'active' } } },
    select: { id: true, clientId: true },
  });
  for (const lead of lapsed) {
    const closed = await prisma.lead.updateMany({
      where: { id: lead.id, status: { in: [...OPEN] } },
      data:  { status: 'CANCELLED' },
    });
    if (closed.count === 0) continue;
    await prisma.leadDistribution.updateMany({ where: { leadId: lead.id, status: 'INVITED' }, data: { status: 'EXPIRED' } });
    createNotification({
      userId: lead.clientId,
      type:   'lead_unmatched',
      title:  'Your request date has passed',
      body:   'No cleaner was confirmed before the scheduled time, so the request was closed. You can reactivate it with a new date from your dashboard.',
      link:   '/dashboard/client',
    }).catch(() => {});
  }

  // A booked job long past its time. Only the client can mark it complete, so a
  // client who vanished left the cleaner without closure or a review, forever.
  const overdue = await prisma.lead.findMany({
    where: {
      status:        'ACCEPTED',
      dateTime:      { lt: new Date(nowDate.getTime() - AUTO_COMPLETE_HOURS * HOUR_MS) },
      conversations: { some: { status: 'active', feeStatus: { in: ['charged', 'waived'] } } },
    },
    select: { id: true, clientId: true, cleanerId: true, frequency: true },
  });
  for (const lead of overdue) {
    const disputed = await prisma.dispute.count({ where: { leadId: lead.id, status: { in: ['OPEN', 'UNDER_REVIEW'] } } });
    if (disputed > 0) continue; // an admin decides this one
    const done = await prisma.lead.updateMany({ where: { id: lead.id, status: 'ACCEPTED' }, data: { status: 'COMPLETED' } });
    if (done.count === 0) continue;
    if (lead.frequency === 'once') {
      await prisma.conversation.updateMany({ where: { leadId: lead.id, status: 'active' }, data: { status: 'closed' } });
    }
    if (lead.cleanerId) {
      createNotification({
        userId: lead.cleanerId,
        type:   'job_completed',
        title:  'Job completed',
        body:   `The job was marked completed automatically ${AUTO_COMPLETE_HOURS} hours after its scheduled time.`,
        link:   '/dashboard/cleaner',
      }).catch(() => {});
    }
    createNotification({
      userId: lead.clientId,
      type:   'job_completed',
      title:  'Your cleaning was marked completed',
      body:   `It closed automatically ${AUTO_COMPLETE_HOURS} hours after the scheduled time. You can leave a review, or open a dispute if something went wrong.`,
      link:   '/dashboard/client',
    }).catch(() => {});
  }

  return rematchIds;
}
