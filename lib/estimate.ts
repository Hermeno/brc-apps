export const SERVICE_TYPES = [
  { id: 'standard',  label: 'Padrão',             labelEn: 'Standard Clean',    icon: '🧹', desc: 'Limpeza completa de rotina',   descEn: 'Regular full-home cleaning' },
  { id: 'deep',      label: 'Pesada / Deep Clean', labelEn: 'Deep Clean',         icon: '✨', desc: 'Limpeza profunda e detalhada', descEn: 'Thorough deep cleaning' },
  { id: 'post-work', label: 'Pós-Obra',            labelEn: 'Post-Construction',  icon: '🔨', desc: 'Limpeza após reformas',         descEn: 'Cleaning after renovation' },
  { id: 'moving',    label: 'Mudança',             labelEn: 'Move In / Move Out', icon: '📦', desc: 'Entrada ou saída de imóvel',   descEn: 'Move-in or move-out cleaning' },
];

export const FREQUENCY_OPTIONS = [
  { id: 'once',     label: 'Única vez', labelEn: 'One-time', discount: 0,    tag: '' },
  { id: 'biweekly', label: 'Quinzenal', labelEn: 'Biweekly', discount: 0.10, tag: '-10%' },
  { id: 'weekly',   label: 'Semanal',   labelEn: 'Weekly',   discount: 0.15, tag: '-15%' },
];

export const EXTRAS = [
  { id: 'fridge',  label: 'Interior da geladeira', labelEn: 'Inside Fridge',   price: 80,  hours: 1.5, icon: '❄️' },
  { id: 'oven',    label: 'Limpeza do forno',       labelEn: 'Oven Cleaning',    price: 60,  hours: 1.0, icon: '🔥' },
  { id: 'windows', label: 'Janelas (int./ext.)',     labelEn: 'Windows (in/out)', price: 100, hours: 2.0, icon: '🪟' },
  { id: 'carpets', label: 'Lavagem de tapetes',      labelEn: 'Carpet Wash',      price: 90,  hours: 1.5, icon: '🛋️' },
];

type ServiceConfig = {
  basePrice: number;
  pricePerRoom: number;
  pricePerBath: number;
  pricePerM2: number;
  baseHours: number;
  hoursPerRoom: number;
  hoursPerBath: number;
  hoursPerM2: number;
};

const SERVICE_CONFIG: Record<string, ServiceConfig> = {
  standard:   { basePrice: 150, pricePerRoom: 20, pricePerBath: 15, pricePerM2: 0.50, baseHours: 2, hoursPerRoom: 1.0, hoursPerBath: 0.50, hoursPerM2: 0.010 },
  deep:       { basePrice: 250, pricePerRoom: 35, pricePerBath: 25, pricePerM2: 0.80, baseHours: 3, hoursPerRoom: 1.5, hoursPerBath: 0.75, hoursPerM2: 0.015 },
  'post-work':{ basePrice: 350, pricePerRoom: 50, pricePerBath: 40, pricePerM2: 1.20, baseHours: 4, hoursPerRoom: 2.0, hoursPerBath: 1.00, hoursPerM2: 0.020 },
  moving:     { basePrice: 200, pricePerRoom: 30, pricePerBath: 20, pricePerM2: 0.70, baseHours: 3, hoursPerRoom: 1.5, hoursPerBath: 0.75, hoursPerM2: 0.012 },
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

  const basePrice =
    cfg.basePrice +
    cfg.pricePerRoom * bedrooms +
    cfg.pricePerBath * bathrooms +
    cfg.pricePerM2 * squareMeters;

  let extraPrice = 0;
  let extraHours = 0;
  for (const extraId of extras) {
    const ex = EXTRAS.find(e => e.id === extraId);
    if (ex) { extraPrice += ex.price; extraHours += ex.hours; }
  }

  const subtotal = basePrice + extraPrice;
  const finalPrice = subtotal * (1 - discount);

  const totalHours =
    cfg.baseHours +
    cfg.hoursPerRoom * bedrooms +
    cfg.hoursPerBath * bathrooms +
    cfg.hoursPerM2 * squareMeters +
    extraHours;

  return {
    minPrice: Math.round(finalPrice * 0.90),
    maxPrice: Math.round(finalPrice * 1.10),
    hours: Math.ceil(totalHours),
    discountPct: Math.round(discount * 100),
  };
}
