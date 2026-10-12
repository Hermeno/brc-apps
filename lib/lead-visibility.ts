import { parseUsAddress } from '@/lib/geo';

// What a cleaner may see about a lead before the lead fee is settled.
//
// The fee buys exactly one thing: the ability to reach this client. So until it
// is settled the cleaner sees everything needed to decide whether to take the
// job — service, time, property size, price estimate, rough area — and nothing
// that lets them reach the client without paying.
//
// Every route that hands a Lead to a cleaner goes through here. That single
// place is the point: the detail leaked because each route built its own Prisma
// selection, and one of them used `include` without `select`, which returns
// every scalar column including the street address and the client's phone.

// 'charged' — the card was billed. 'waived' — a free-lead credit or a $0 promo
// covered it. Anything else (pending, failed, refunded) means nothing was paid.
export function isFeeSettled(feeStatus: string | null | undefined): boolean {
  return feeStatus === 'charged' || feeStatus === 'waived';
}

// "123 Main St, Miami, FL 33101" → "Miami, FL 33101". Falls back through the
// stored ZIP and then to a plain label, so this never returns a street line by
// accident — if the address cannot be parsed, the cleaner sees less, not more.
export function approximateArea(address: string, zipCode: string | null): string {
  const { city, state, zip } = parseUsAddress(address);
  const postal = zip ?? zipCode;

  const parts = [city, state].filter(Boolean).join(', ');
  if (parts && postal) return `${parts} ${postal}`;
  if (parts)           return parts;
  if (postal)          return postal;
  return 'Area shared after booking';
}

// Coordinates are rounded to about a kilometre. Precise ones would undo the
// address masking on their own, and nothing in the cleaner's view needs more:
// the radius filter already ran server-side before this lead was offered.
function coarse(value: number): number {
  return Math.round(value * 100) / 100;
}

type RedactableLead = {
  address:     string;
  zipCode:     string | null;
  notes:       string | null;
  clientPhone: string | null;
  photos:      string[];
  latitude:    number;
  longitude:   number;
};

// Returns the same shape with the identifying detail removed, so callers and the
// UI keep reading `lead.address` — it just holds the area instead of the street.
// `addressIsApproximate` lets the UI label it honestly.
export function redactLeadForCleaner<T extends RedactableLead>(
  lead: T,
): T & { addressIsApproximate: true } {
  return {
    ...lead,
    address:     approximateArea(lead.address, lead.zipCode),
    notes:       null,   // can hold gate codes, "key is under the mat", a surname
    clientPhone: null,
    photos:      [],     // photos of the property identify it as well as the address
    latitude:    coarse(lead.latitude),
    longitude:   coarse(lead.longitude),
    addressIsApproximate: true,
  };
}

// Convenience for the common case: redact unless this cleaner has settled the fee.
export function leadForCleaner<T extends RedactableLead>(
  lead: T,
  feeStatus: string | null | undefined,
): T | (T & { addressIsApproximate: true }) {
  return isFeeSettled(feeStatus) ? lead : redactLeadForCleaner(lead);
}
