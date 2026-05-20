// ─── OP (Opportunity Price) — lead price charged to the winning cleaner ──────

import { prisma } from './prisma';

type ServiceKey = 'standard' | 'deep' | 'post-work' | 'moving';

const BASE_PRICE: Record<ServiceKey, number> = {
  standard:    10,
  deep:        20,
  'post-work': 32,
  moving:      32,
};

export function detectServiceKey(serviceType: string): ServiceKey {
  const s = serviceType.toLowerCase();
  if (s.includes('pesada') || s.includes('deep') || s.includes('profunda') || s === 'deep_cleaning') return 'deep';
  if (s.includes('obra')   || s.includes('post') || s === 'post_construction')                       return 'post-work';
  if (s.includes('mudança') || s.includes('moving') || s === 'move_in_out')                          return 'moving';
  return 'standard';
}

// Config shape returned by getLeadPriceConfig()
export type LeadPriceConfig = {
  priceMap:       Record<string, number>;
  sameDayMult:    number;
  recurringMult:  number;
  coverageZips:   string[];
};

// Fetch admin-configured pricing from DB; falls back to defaults on any error
export async function getLeadPriceConfig(): Promise<LeadPriceConfig> {
  try {
    const [prices, platform] = await Promise.all([
      prisma.$queryRaw<{ id: string; price: number }[]>`SELECT id, price FROM "LeadPriceConfig"`.catch(() => []),
      prisma.$queryRaw<{ id: string; value: string }[]>`SELECT id, value FROM "LeadPlatformConfig"`.catch(() => []),
    ]);

    const priceMap: Record<string, number> = {};
    for (const p of prices) priceMap[p.id] = p.price;

    const plat = Object.fromEntries(platform.map(p => [p.id, p.value]));
    const sameDayMult   = parseFloat(plat.same_day_multiplier  ?? '1.5');
    const recurringMult = parseFloat(plat.recurring_multiplier ?? '1.3');
    const coverageZips: string[] = JSON.parse(plat.coverage_zips ?? '[]');

    return { priceMap, sameDayMult, recurringMult, coverageZips };
  } catch {
    return { priceMap: {}, sameDayMult: 1.5, recurringMult: 1.3, coverageZips: [] };
  }
}

export function calculateLeadPrice(
  serviceType: string,
  dateTime: Date,
  frequency = 'once',
  config?: Pick<LeadPriceConfig, 'priceMap' | 'sameDayMult' | 'recurringMult'>,
): number {
  const key = detectServiceKey(serviceType);
  let price = config?.priceMap?.[key] ?? BASE_PRICE[key];

  const sameDayMult   = config?.sameDayMult   ?? 1.5;
  const recurringMult = config?.recurringMult ?? 1.3;

  const hoursUntil = (dateTime.getTime() - Date.now()) / 3_600_000;
  if (hoursUntil < 24) price = Math.round(price * sameDayMult);
  if (frequency === 'weekly' || frequency === 'biweekly') price = Math.round(price * recurringMult);

  return price;
}

// ─── Subscription plan details ────────────────────────────────────────────────

export const PLANS = [
  {
    id:       'FREE',
    name:     'Free',
    price:    0,
    color:    'slate',
    badge:    '',
    perks: [
      'Acesso ao marketplace',
      'Wave 2 apenas',
      'Sem prioridade no ranking',
    ],
    rankingBonus: 0,
  },
  {
    id:       'BASIC',
    name:     'Basic',
    price:    29,
    color:    'brand',
    badge:    'Popular',
    perks: [
      'Wave 1 + Wave 2',
      '+10 pontos no ranking CFS',
      'Perfil destacado',
    ],
    rankingBonus: 10,
  },
  {
    id:       'PREMIUM',
    name:     'Premium',
    price:    49,
    color:    'purple',
    badge:    'Recomendado',
    perks: [
      'Wave 1 + Wave 2 (prioridade)',
      '+20 pontos no ranking CFS',
      'Badge Premium no perfil',
      'Priority support',
    ],
    rankingBonus: 20,
  },
  {
    id:       'PRO',
    name:     'Pro',
    price:    79,
    color:    'yellow',
    badge:    'Max',
    perks: [
      'Topo do ranking CFS',
      '+30 pontos garantidos',
      'Instant Book eligible',
      'Badge Pro exclusivo',
      'Advanced analytics',
    ],
    rankingBonus: 30,
  },
] as const;
