// ─── OP (Opportunity Price) — lead price charged to the winning cleaner ──────

import { prisma } from './prisma';

type ServiceKey = 'standard' | 'deep' | 'post-work' | 'moving';

const PRICE_RANGE: Record<ServiceKey, [number, number]> = {
  standard:    [8,  12],
  deep:        [15, 25],
  'post-work': [25, 40],
  moving:      [25, 40],
};

function randInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

export function detectServiceKey(serviceType: string): ServiceKey {
  const s = serviceType.toLowerCase();
  if (s.includes('pesada') || s.includes('deep') || s.includes('profunda') || s === 'deep_cleaning') return 'deep';
  if (s.includes('obra')   || s.includes('post') || s === 'post_construction')                       return 'post-work';
  if (s.includes('mudança') || s.includes('moving') || s === 'move_in_out')                          return 'moving';
  return 'standard';
}

// Config shape returned by getLeadPriceConfig()
export type LeadPriceConfig = {
  priceMap:     Record<string, number>;
  coverageZips: string[];
};

// Fetch admin-configured lead price overrides + coverage ZIPs from DB
export async function getLeadPriceConfig(): Promise<LeadPriceConfig> {
  try {
    const [prices, platform] = await Promise.all([
      prisma.$queryRaw<{ id: string; price: number }[]>`
        SELECT id, price FROM "LeadPriceConfig"
      `.catch(() => [] as { id: string; price: number }[]),
      prisma.$queryRaw<{ id: string; value: string }[]>`
        SELECT id, value FROM "LeadPlatformConfig"
      `.catch(() => [] as { id: string; value: string }[]),
    ]);

    const priceMap: Record<string, number> = {};
    for (const p of prices) priceMap[p.id] = p.price;

    const plat = Object.fromEntries(platform.map(p => [p.id, p.value]));
    const coverageZips: string[] = JSON.parse(plat.coverage_zips ?? '[]');

    return { priceMap, coverageZips };
  } catch {
    return { priceMap: {}, coverageZips: [] };
  }
}

export function calculateLeadPrice(
  serviceType: string,
  _dateTime?: Date,
  _frequency?: string,
  config?: Pick<LeadPriceConfig, 'priceMap'>,
): number {
  const key = detectServiceKey(serviceType);

  // If admin has set a fixed override for this key, use it; otherwise pick randomly in range
  if (config?.priceMap?.[key] !== undefined) {
    return config.priceMap[key];
  }

  const [min, max] = PRICE_RANGE[key];
  return randInRange(min, max);
}

// ─── Subscription plan details ────────────────────────────────────────────────

export const PLANS = [
  {
    id:    'FREE',
    name:  'Free',
    price: 0,
    color: 'slate',
    badge: '',
    perks: [
      'Basic profile listing',
      'Wave 2 access only',
      'Limited range (25 mi)',
      'No verified badge',
      'No ranking priority',
    ],
    rankingBonus: 0,
    maxRadiusMiles: 25,
  },
  {
    id:    'BASIC',
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
    id:    'PRO',
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

export type PlanId = 'FREE' | 'BASIC' | 'PRO';
