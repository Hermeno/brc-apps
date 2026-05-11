// ─── OP (Opportunity Price) — lead price charged to the winning cleaner ──────

type ServiceKey = 'standard' | 'deep' | 'post-work' | 'moving';

const BASE_PRICE: Record<ServiceKey, number> = {
  standard: 10,
  deep:     20,
  'post-work': 30,
  moving:   30,
};

export function detectServiceKey(serviceType: string): ServiceKey {
  const s = serviceType.toLowerCase();
  if (s.includes('pesada') || s.includes('deep') || s.includes('profunda') || s === 'deep_cleaning') return 'deep';
  if (s.includes('obra')   || s.includes('post') || s === 'post_construction')                       return 'post-work';
  if (s.includes('mudança') || s.includes('moving') || s === 'move_in_out')                          return 'moving';
  return 'standard';
}

export function calculateLeadPrice(
  serviceType: string,
  dateTime: Date,
  frequency = 'once',
): number {
  let price = BASE_PRICE[detectServiceKey(serviceType)];

  // Same-day urgency multiplier
  const hoursUntil = (dateTime.getTime() - Date.now()) / 3_600_000;
  if (hoursUntil < 24) price = Math.round(price * 1.5);

  // Recurring premium
  if (frequency === 'weekly' || frequency === 'biweekly') {
    price = Math.round(price * 1.3);
  }

  return price;
}

// ─── Subscription plan details ────────────────────────────────────────────────

export const PLANS = [
  {
    id:       'FREE',
    name:     'Grátis',
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
      'Suporte prioritário',
    ],
    rankingBonus: 20,
  },
  {
    id:       'PRO',
    name:     'Pro',
    price:    79,
    color:    'yellow',
    badge:    'Máximo',
    perks: [
      'Topo do ranking CFS',
      '+30 pontos garantidos',
      'Instant Book elegível',
      'Badge Pro exclusivo',
      'Analytics avançado',
    ],
    rankingBonus: 30,
  },
] as const;
