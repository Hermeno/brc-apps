export type PlanId = 'FREE' | 'BASIC' | 'PRO';

export const PLANS = [
  {
    id:    'FREE' as PlanId,
    name:  'Free',
    price: 0,
    color: 'slate',
    badge: '',
    perks: [
      'Receive and answer requests',
      'Radius up to 25 mi',
      'No placement bonus',
    ],
    rankingBonus: 0,
    maxRadiusMiles: 25,
  },
  {
    id:    'BASIC' as PlanId,
    name:  'Basic',
    price: 29,
    color: 'brand',
    badge: 'Popular',
    perks: [
      '+15 points in your match score',
      'Considered earlier when several cleaners fit',
      'Radius up to 40 mi',
    ],
    rankingBonus: 15,
    maxRadiusMiles: 40,
  },
  {
    id:    'PRO' as PlanId,
    name:  'Pro',
    price: 49,
    color: 'yellow',
    badge: 'Max',
    perks: [
      '+30 points in your match score',
      'Instant Book: strong matches offered to you first',
      'Radius up to 60 mi',
      '"Top Cleaner" profile badge',
    ],
    rankingBonus: 30,
    maxRadiusMiles: 60,
  },
] as const;

// ─── Service radius (miles) — single source of truth ─────────────────────────
// Every place that reads, validates, or renders a cleaner's service radius
// must use these. Do NOT hardcode radius numbers or plan caps anywhere else.

// Maximum radius a cleaner may set, by plan. PREMIUM is a legacy alias of PRO.
// Free covers a local area (about a 30–40 minute drive); each paid plan reaches
// further, so reach is what a plan buys. 60 mi from central Connecticut covers
// nearly the whole state.
export const PLAN_MAX_RADIUS: Record<string, number> = {
  FREE: 25, BASIC: 40, PRO: 60, PREMIUM: 60,
};

// The exact set of radius options offered in the UI (onboarding AND profile).
export const RADIUS_OPTIONS = [10, 15, 25, 40, 60] as const;

// Default radius for a brand-new cleaner (also the DB column default).
export const DEFAULT_RADIUS_MILES = 25;

// Cap a cleaner's plan to its maximum allowed radius. Unknown plans → FREE cap.
export function maxRadiusForPlan(plan: string | null | undefined): number {
  return PLAN_MAX_RADIUS[plan ?? 'FREE'] ?? PLAN_MAX_RADIUS.FREE;
}

// Clamp any requested radius to a valid value for the given plan.
export function clampRadiusForPlan(radius: number, plan: string | null | undefined): number {
  const max = maxRadiusForPlan(plan);
  if (!Number.isFinite(radius) || radius <= 0) return DEFAULT_RADIUS_MILES;
  return Math.min(Math.round(radius), max);
}
