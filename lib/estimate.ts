export const SERVICE_TYPES = [
  { id: 'standard',          label: 'Padrão',                   labelEn: 'Standard Clean',              icon: '🧹', desc: 'Limpeza completa de rotina',        descEn: 'Regular full-home cleaning' },
  { id: 'deep',              label: 'Pesada / Deep Clean',       labelEn: 'Deep Clean',                  icon: '✨', desc: 'Limpeza profunda e detalhada',      descEn: 'Thorough deep cleaning' },
  { id: 'post-work',         label: 'Pós-Obra',                  labelEn: 'Post-Construction',           icon: '🔨', desc: 'Limpeza após reformas',             descEn: 'Cleaning after renovation' },
  { id: 'moving',            label: 'Mudança',                   labelEn: 'Move In / Move Out',          icon: '📦', desc: 'Entrada ou saída de imóvel',        descEn: 'Move-in or move-out cleaning' },
  { id: 'deck-cleaning',     label: 'Limpeza de Deck',           labelEn: 'Deck Cleaning',               icon: '🪵', desc: 'Limpeza de decks e superfícies externas', descEn: 'Deck surface cleaning' },
  { id: 'pressure-washing',  label: 'Lavagem a Pressão',         labelEn: 'Pressure Washing',            icon: '💦', desc: 'Lavagem de alta pressão de exteriores',   descEn: 'High-pressure exterior washing' },
  { id: 'gutter-cleaning',   label: 'Limpeza de Calhas',         labelEn: 'Gutter Cleaning',             icon: '🍂', desc: 'Remoção de detritos em calhas',     descEn: 'Gutter debris removal and flush' },
  { id: 'flashing-cleaning', label: 'Limpeza de Rufos',          labelEn: 'Flashing Cleaning',           icon: '🏠', desc: 'Limpeza de rufos e vedações de telhado', descEn: 'Roof flashing and sealant cleaning' },
  { id: 'tile-grout',        label: 'Limpeza de Azulejos',       labelEn: 'Tile & Grout Cleaning',       icon: '🔲', desc: 'Restauração de azulejos e rejuntes', descEn: 'Tile surface and grout restoration' },
  { id: 'home-organizing',   label: 'Organização Residencial',   labelEn: 'Home Organizing',             icon: '📋', desc: 'Organização e destralhe de ambientes',    descEn: 'Declutter and organize any space' },
  { id: 'garage-attic',      label: 'Garagem / Porão / Sótão',   labelEn: 'Garage, Basement or Attic',   icon: '🏚️', desc: 'Limpeza profunda de espaços utilitários', descEn: 'Deep clean of utility spaces' },
  { id: 'commercial',        label: 'Limpeza Comercial',         labelEn: 'Commercial Cleaning',         icon: '🏢', desc: 'Escritórios e espaços comerciais',   descEn: 'Offices and commercial spaces' },
];

export const FREQUENCY_OPTIONS = [
  { id: 'once',      label: 'Única vez', labelEn: 'One-time', discount: 0,    tag: '' },
  { id: 'biweekly',  label: 'Quinzenal', labelEn: 'Biweekly', discount: 0.10, tag: '-10%' },
  { id: 'weekly',    label: 'Semanal',   labelEn: 'Weekly',   discount: 0.15, tag: '-15%' },
];

export const EXTRAS = [
  { id: 'fridge',  label: 'Interior da geladeira', labelEn: 'Inside Fridge',   price: 45, hours: 1.00, icon: '❄️' },
  { id: 'oven',    label: 'Limpeza do forno',       labelEn: 'Oven Cleaning',   price: 35, hours: 0.75, icon: '🔥' },
  { id: 'windows', label: 'Janelas (int./ext.)',     labelEn: 'Windows (in/out)',price: 90, hours: 1.50, icon: '🪟' },
  { id: 'carpets', label: 'Limpeza de tapetes',      labelEn: 'Carpet Cleaning', price: 70, hours: 1.50, icon: '🛋️' },
];

// ─────────────────────────────────────────────────────────────
// Real US market pricing (USD)
//
// Standard (2 bed / 1 bath) → ~$185   target range $80–$250
// Deep     (2 bed / 1 bath) → ~$325   target range $200–$500
// Post-construction         → ~$485+  target range $300–$800+
// Moving   (2 bed / 1 bath) → ~$315   similar to deep
// ─────────────────────────────────────────────────────────────
type ServiceConfig = {
  basePrice: number;
  pricePerRoom: number;
  pricePerBath: number;
  pricePerSqft: number;
  baseHours: number;
  hoursPerRoom: number;
  hoursPerBath: number;
  hoursPerSqft: number;
};

const SERVICE_CONFIG: Record<string, ServiceConfig> = {
  // ~$45/hr implied rate
  standard:           { basePrice: 90,  pricePerRoom: 30, pricePerBath: 35, pricePerSqft: 0.06, baseHours: 1.5, hoursPerRoom: 1.00, hoursPerBath: 0.75, hoursPerSqft: 0.002 },
  // ~$50/hr implied rate
  deep:               { basePrice: 150, pricePerRoom: 55, pricePerBath: 65, pricePerSqft: 0.10, baseHours: 2.0, hoursPerRoom: 1.50, hoursPerBath: 1.25, hoursPerSqft: 0.003 },
  // ~$55/hr implied rate — most expensive service
  'post-work':        { basePrice: 250, pricePerRoom: 75, pricePerBath: 85, pricePerSqft: 0.18, baseHours: 3.0, hoursPerRoom: 2.00, hoursPerBath: 1.75, hoursPerSqft: 0.005 },
  // between standard and deep
  moving:             { basePrice: 160, pricePerRoom: 50, pricePerBath: 55, pricePerSqft: 0.08, baseHours: 2.0, hoursPerRoom: 1.25, hoursPerBath: 1.00, hoursPerSqft: 0.003 },
  // outdoor/surface — sqft-driven, rooms/baths less relevant
  'deck-cleaning':    { basePrice: 120, pricePerRoom: 0,  pricePerBath: 0,  pricePerSqft: 0.12, baseHours: 2.0, hoursPerRoom: 0,    hoursPerBath: 0,    hoursPerSqft: 0.003 },
  'pressure-washing': { basePrice: 150, pricePerRoom: 0,  pricePerBath: 0,  pricePerSqft: 0.15, baseHours: 2.0, hoursPerRoom: 0,    hoursPerBath: 0,    hoursPerSqft: 0.004 },
  // linear-foot work — base price dominates
  'gutter-cleaning':  { basePrice: 180, pricePerRoom: 20, pricePerBath: 0,  pricePerSqft: 0.04, baseHours: 2.5, hoursPerRoom: 0.25, hoursPerBath: 0,    hoursPerSqft: 0.001 },
  'flashing-cleaning':{ basePrice: 120, pricePerRoom: 0,  pricePerBath: 0,  pricePerSqft: 0.06, baseHours: 1.5, hoursPerRoom: 0,    hoursPerBath: 0,    hoursPerSqft: 0.002 },
  // interior specialty — bath count matters most
  'tile-grout':       { basePrice: 140, pricePerRoom: 40, pricePerBath: 65, pricePerSqft: 0.08, baseHours: 2.0, hoursPerRoom: 0.75, hoursPerBath: 1.25, hoursPerSqft: 0.003 },
  'home-organizing':  { basePrice: 130, pricePerRoom: 45, pricePerBath: 0,  pricePerSqft: 0.05, baseHours: 2.5, hoursPerRoom: 1.25, hoursPerBath: 0,    hoursPerSqft: 0.002 },
  'garage-attic':     { basePrice: 150, pricePerRoom: 0,  pricePerBath: 0,  pricePerSqft: 0.10, baseHours: 2.5, hoursPerRoom: 0,    hoursPerBath: 0,    hoursPerSqft: 0.003 },
  // commercial — similar scope to post-work
  commercial:         { basePrice: 250, pricePerRoom: 60, pricePerBath: 70, pricePerSqft: 0.15, baseHours: 3.0, hoursPerRoom: 1.50, hoursPerBath: 1.25, hoursPerSqft: 0.004 },
};

export type EstimateResult = {
  minPrice: number;
  maxPrice: number;
  hours: number;
  discountPct: number;
};

export function calculateEstimate(params: {
  serviceType: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  extras: string[];
  frequency: string;
}): EstimateResult {
  const { serviceType, bedrooms, bathrooms, squareMeters, extras, frequency } = params;

  const cfg = SERVICE_CONFIG[serviceType] ?? SERVICE_CONFIG.standard;
  const freqOpt = FREQUENCY_OPTIONS.find(f => f.id === frequency);
  const discount = freqOpt?.discount ?? 0;

  // squareMeters input converted to sqft for the coefficient
  const sqft = squareMeters * 10.764;

  const basePrice =
    cfg.basePrice +
    cfg.pricePerRoom * bedrooms +
    cfg.pricePerBath * bathrooms +
    cfg.pricePerSqft * sqft;

  let extraPrice = 0;
  let extraHours = 0;
  for (const extraId of extras) {
    const ex = EXTRAS.find(e => e.id === extraId);
    if (ex) { extraPrice += ex.price; extraHours += ex.hours; }
  }

  const subtotal   = basePrice + extraPrice;
  const finalPrice = subtotal * (1 - discount);

  const totalHours =
    cfg.baseHours +
    cfg.hoursPerRoom  * bedrooms +
    cfg.hoursPerBath  * bathrooms +
    cfg.hoursPerSqft  * sqft +
    extraHours;

  return {
    minPrice:    Math.round(finalPrice * 0.90),
    maxPrice:    Math.round(finalPrice * 1.10),
    hours:       Math.ceil(totalHours),
    discountPct: Math.round(discount * 100),
  };
}
