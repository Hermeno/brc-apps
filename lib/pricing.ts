// ─── OP (Opportunity Price) — lead price charged to the winning cleaner ──────

import { prisma } from './prisma';
export { PLANS, type PlanId } from './plans';

type ServiceKey =
  | 'standard' | 'deep' | 'post-work' | 'moving'
  | 'deck-cleaning' | 'pressure-washing' | 'gutter-cleaning' | 'flashing-cleaning'
  | 'tile-grout' | 'home-organizing' | 'garage-attic' | 'commercial';

const PRICE_RANGE: Record<ServiceKey, [number, number]> = {
  standard:           [8,  12],
  deep:               [15, 25],
  'post-work':        [25, 40],
  moving:             [25, 40],
  'deck-cleaning':    [10, 18],
  'pressure-washing': [12, 20],
  'gutter-cleaning':  [15, 25],
  'flashing-cleaning':[10, 18],
  'tile-grout':       [12, 20],
  'home-organizing':  [15, 25],
  'garage-attic':     [15, 25],
  commercial:         [25, 40],
};

function randInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

export function detectServiceKey(serviceType: string): ServiceKey {
  const s = serviceType.toLowerCase();
  if (s.includes('pesada') || s.includes('deep') || s.includes('profunda') || s === 'deep_cleaning') return 'deep';
  if (s.includes('obra')   || s.includes('post') || s === 'post_construction')                       return 'post-work';
  if (s.includes('mudança') || s.includes('moving') || s === 'move_in_out')                          return 'moving';
  if (s.includes('pressure') || s.includes('power wash') || s.includes('pressão'))                   return 'pressure-washing';
  if (s.includes('deck'))                                                                             return 'deck-cleaning';
  if (s.includes('gutter') || s.includes('calha'))                                                   return 'gutter-cleaning';
  if (s.includes('flashing') || s.includes('rufo'))                                                  return 'flashing-cleaning';
  if (s.includes('tile') || s.includes('grout') || s.includes('azulejo') || s.includes('rejunte'))  return 'tile-grout';
  if (s.includes('organ'))                                                                            return 'home-organizing';
  if (s.includes('garage') || s.includes('basement') || s.includes('attic') || s.includes('porão') || s.includes('sótão')) return 'garage-attic';
  if (s.includes('commercial') || s.includes('comercial'))                                           return 'commercial';
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

