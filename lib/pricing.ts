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
    id:    'FREE',
    name:  'Free',
    price: 0,
    color: 'slate',
    badge: '',
    perks: [
      'Perfil na plataforma',
      'Wave 2 apenas',
      'Raio limitado (25 mi)',
      'Sem badge',
      'Sem prioridade no ranking',
    ],
    rankingBonus: 0,
    maxRadiusMiles: 25,
  },
  {
    id:    'BASIC',
    name:  'Basic',
    price: 39.99,
    color: 'brand',
    badge: 'Popular',
    perks: [
      'Acesso ao Express Match',
      'Wave 1 + Wave 2',
      '+15 pontos no ranking CFS',
      'Raio ampliado (40 mi)',
      'Perfil verificado',
    ],
    rankingBonus: 15,
    maxRadiusMiles: 40,
  },
  {
    id:    'PRO',
    name:  'Pro',
    price: 68.99,
    color: 'yellow',
    badge: 'Max',
    perks: [
      'Prioridade máxima no ranking',
      'Wave 1 frequente + Instant Book',
      '+30 pontos garantidos',
      'Raio máximo (60 mi)',
      'Badge "Top Cleaner" no perfil',
      'Acesso a leads recorrentes',
    ],
    rankingBonus: 30,
    maxRadiusMiles: 60,
  },
] as const;

export type PlanId = 'FREE' | 'BASIC' | 'PRO';
