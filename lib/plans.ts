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
      'Limited range (25 mi)',
      'No verified badge',
      'No ranking priority',
    ],
    rankingBonus: 0,
    maxRadiusMiles: 25,
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
