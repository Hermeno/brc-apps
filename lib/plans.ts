export type PlanId = 'FREE' | 'BASIC' | 'PRO';

export const PLANS = [
  {
    id:    'FREE' as PlanId,
    name:  'Free',
    price: 0,
    color: 'slate',
    badge: '',
    perks: [
      'Basic profile listing',
      'Wave 2 access only',
      'Limited range (60 mi)',
      'No verified badge',
      'No ranking priority',
    ],
    rankingBonus: 0,
    maxRadiusMiles: 60,
  },
  {
    id:    'BASIC' as PlanId,
    name:  'Basic',
    price: 39,
    color: 'brand',
    badge: 'Popular',
    perks: [
      'Express Match access',
      'Wave 1 + Wave 2',
      '+15 pts in CFS ranking',
      'Extended range (60 mi)',
      'Verified profile badge',
    ],
    rankingBonus: 15,
    maxRadiusMiles: 60,
  },
  {
    id:    'PRO' as PlanId,
    name:  'Pro',
    price: 79,
    color: 'yellow',
    badge: 'Max',
    perks: [
      'Top priority in ranking',
      'Wave 1 + Instant Book',
      '+30 pts guaranteed',
      'Maximum range (110 mi)',
      '"Top Cleaner" profile badge',
      'Recurring lead access',
    ],
    rankingBonus: 30,
    maxRadiusMiles: 110,
  },
] as const;

// ─── Service radius (miles) — single source of truth ─────────────────────────
// Every place that reads, validates, or renders a cleaner's service radius
// must use these. Do NOT hardcode radius numbers or plan caps anywhere else.

// Maximum radius a cleaner may set, by plan. PREMIUM is a legacy alias of PRO.
export const PLAN_MAX_RADIUS: Record<string, number> = {
  FREE: 60, BASIC: 60, PRO: 110, PREMIUM: 110,
};

// The exact set of radius options offered in the UI (onboarding AND profile).
export const RADIUS_OPTIONS = [15, 25, 40, 60, 80, 110] as const;

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
