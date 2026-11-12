// ─── OP (Opportunity Price) — lead price charged to the winning cleaner ──────

import { prisma } from './prisma';
export { PLANS, type PlanId } from './plans';

type ServiceKey =
  | 'standard' | 'deep' | 'post-work' | 'moving'
  | 'deck-cleaning' | 'pressure-washing' | 'gutter-cleaning' | 'flashing-cleaning'
  | 'tile-grout' | 'home-organizing' | 'garage-attic' | 'commercial';

// Fee per accepted lead: about 6% of lib/estimate's price for a 2-bed job of that
// type. Defaults only — the admin Lead Prices screen (LeadPriceConfig) overrides each.
export const LEAD_PRICE_DEFAULTS: Record<ServiceKey, number> = {
  standard:            15,
  deep:                25,
  moving:              25,
  'post-work':         39,
  commercial:          35,
  'tile-grout':        20,
  'pressure-washing':  20,
  'gutter-cleaning':   15,
  'home-organizing':   15,
  'garage-attic':      15,
  'deck-cleaning':     15,
  'flashing-cleaning': 10,
};

// A weekly/biweekly client is worth many visits, but many book only once — so 1.5×, not more.
export const RECURRING_MULTIPLIER = 1.5;

export function detectServiceKey(serviceType: string): ServiceKey {
  const s = serviceType.toLowerCase();
  if (s.includes('pesada') || s.includes('deep') || s.includes('profunda') || s === 'deep_cleaning') return 'deep';
  if (s.includes('obra')   || s.includes('post') || s === 'post_construction')                       return 'post-work';
  if (s.includes('mudança') || s.includes('moving') || s.includes('move'))                           return 'moving';
  if (s.includes('pressure') || s.includes('power wash') || s.includes('pressão'))                   return 'pressure-washing';
  if (s.includes('deck'))                                                                             return 'deck-cleaning';
  if (s.includes('gutter') || s.includes('calha'))                                                   return 'gutter-cleaning';
  if (s.includes('flashing') || s.includes('rufo'))                                                  return 'flashing-cleaning';
  if (s.includes('tile') || s.includes('grout') || s.includes('azulejo') || s.includes('rejunte'))  return 'tile-grout';
  if (s.includes('organ'))                                                                            return 'home-organizing';
  if (s.includes('garage') || s.includes('basement') || s.includes('attic') || s.includes('porão') || s.includes('sótão')) return 'garage-attic';
  if (s.includes('commercial') || s.includes('comercial') || s.includes('office'))                   return 'commercial';
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
  frequency?: string | null,
  config?: Pick<LeadPriceConfig, 'priceMap'>,
): number {
  const key  = detectServiceKey(serviceType);
  const base = config?.priceMap?.[key] ?? LEAD_PRICE_DEFAULTS[key];
  return frequency === 'weekly' || frequency === 'biweekly'
    ? Math.round(base * RECURRING_MULTIPLIER)
    : base;
}
