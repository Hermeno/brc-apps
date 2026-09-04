// @ts-ignore — zipcodes has no bundled types
import * as zipcodes from 'zipcodes';
import { prisma } from './prisma';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GeoPoint = { lat: number; lng: number };

/** How the coordinates were obtained, best to worst. */
export type GeoPrecision = 'gps' | 'street' | 'zip' | 'city';

export type GeoResult = GeoPoint & {
  zip:       string | null;
  city:      string | null;
  state:     string | null;
  precision: GeoPrecision;
};

export type ParsedAddress = {
  street: string | null;
  city:   string | null;
  state:  string | null;  // 2-letter code
  zip:    string | null;  // validated against the ZIP dataset
};

// ─── Distance ─────────────────────────────────────────────────────────────────

// Haversine formula — returns distance in miles between two lat/lng points
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── ZIP lookups ──────────────────────────────────────────────────────────────

type ZipRecord = { zip: string; latitude: number; longitude: number; city: string; state: string };

function lookupZip(zip: string): ZipRecord | null {
  const info = zipcodes.lookup(zip);
  // The dataset returns entries without coordinates for a few ZIPs.
  if (!info || typeof info.latitude !== 'number' || typeof info.longitude !== 'number') return null;
  return info as ZipRecord;
}

/** Returns the 5-digit ZIP only if it actually exists in the dataset. */
export function normalizeZip(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = String(raw).trim().match(/^(\d{5})(?:-\d{4})?$/);
  if (!digits) return null;
  return lookupZip(digits[1]) ? digits[1] : null;
}

// ZIP → { lat, lng } using the bundled zipcodes dataset (no API needed)
export function coordsFromZip(zip: string): GeoPoint | null {
  if (!zip) return null;
  const info = lookupZip(zip.trim());
  return info ? { lat: info.latitude, lng: info.longitude } : null;
}

// ─── Free-text US address parsing ─────────────────────────────────────────────

const STATE_BY_NAME: Record<string, string> = (zipcodes as any).states.full;
const STATE_CODES: Set<string> = new Set(Object.values(STATE_BY_NAME));

/** Uppercase, strip accents and punctuation, collapse whitespace. */
function normalizeText(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Finds the state, written either as a code (FL) or a full name (Florida), and
 * where it starts so the city can be read from the text in front of it.
 *
 * The search is anchored to the end of the address on purpose. Matching a state
 * name anywhere would read "Miami, FLORIDA" as ending in a city called Lorida —
 * which exists in Florida — and drop the lead 130 miles off target.
 */
function detectState(normalized: string): { code: string; start: number } | null {
  // Drop a trailing ZIP so the state becomes the last meaningful token.
  const body = normalized.replace(/\s+\d{5}(?:-\d{4})?$/, '');

  for (const name of Object.keys(STATE_BY_NAME)) {
    if (body === name)                return { code: STATE_BY_NAME[name], start: 0 };
    if (body.endsWith(' ' + name))    return { code: STATE_BY_NAME[name], start: body.length - name.length };
  }

  const tokens = body.split(' ');
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (STATE_CODES.has(tokens[i])) {
      const start = tokens.slice(0, i).join(' ').length + (i > 0 ? 1 : 0);
      return { code: tokens[i], start };
    }
  }
  return null;
}

// City lists are derived from the ZIP dataset per state and reused across calls.
const cityCache = new Map<string, string[]>();

function citiesForState(state: string): string[] {
  const cached = cityCache.get(state);
  if (cached) return cached;

  const rows: ZipRecord[] = zipcodes.lookupByState(state) ?? [];
  const cities = [...new Set(rows.map(r => normalizeText(r.city)).filter(Boolean))];
  cityCache.set(state, cities);
  return cities;
}

/** Edit distance a city name of this length is allowed to be off by. */
function cityTolerance(len: number): number {
  return len <= 4 ? 0 : len <= 7 ? 1 : 2;
}

/**
 * Closest real city in the state to what the client typed ("MAIMI BEACH" →
 * "MIAMI BEACH"). Returns null when nothing is close enough to be confident.
 */
function fuzzyCity(candidate: string, state: string): { city: string; score: number } | null {
  const tolerance = cityTolerance(candidate.length);
  if (tolerance === 0) return null;

  let best: string | null = null;
  let bestScore = tolerance + 1;
  for (const city of citiesForState(state)) {
    // Length gap alone already exceeds the budget — skip the expensive compare.
    if (Math.abs(city.length - candidate.length) > tolerance) continue;
    const score = levenshtein(candidate, city);
    if (score < bestScore) { bestScore = score; best = city; }
  }
  return best ? { city: best, score: bestScore } : null;
}

/**
 * Reads the city out of the words before the state. City names run up to three
 * words ("PALM BEACH GARDENS"), so every length is tried: exact matches first
 * across all of them, then the closest fuzzy match. Taking the best score rather
 * than the first hit stops a street suffix from being read as a city.
 */
function extractCity(beforeState: string, state: string): string | null {
  const tokens = beforeState.split(' ').filter(Boolean);
  if (tokens.length === 0) return null;

  const cities     = citiesForState(state);
  const candidates = [3, 2, 1]
    .filter(n => n <= tokens.length)
    .map(n => tokens.slice(-n).join(' '));

  for (const candidate of candidates) {
    if (cities.includes(candidate)) return candidate;
  }

  let best: { city: string; score: number } | null = null;
  for (const candidate of candidates) {
    const hit = fuzzyCity(candidate, state);
    if (hit && (!best || hit.score < best.score)) best = hit;
  }
  return best?.city ?? null;
}

// Enough of the common suffixes to tell "900 Biscayne Blvd" from "Apt 20850".
const STREET_SUFFIXES = new Set([
  'ST', 'STREET', 'AVE', 'AVENUE', 'RD', 'ROAD', 'DR', 'DRIVE', 'BLVD', 'BOULEVARD',
  'LN', 'LANE', 'CT', 'COURT', 'PL', 'PLACE', 'TER', 'TERRACE', 'WAY', 'CIR', 'CIRCLE',
  'PKWY', 'PARKWAY', 'HWY', 'HIGHWAY', 'TRL', 'TRAIL', 'LOOP', 'PATH', 'RUN', 'SQ',
]);

/**
 * The segment that looks like a street line — the one worth sending to a
 * street-level geocoder. A unit number alone ("Apt 20850") is not one.
 */
function extractStreet(raw: string): string | null {
  const segments = raw.split(',').map(s => s.trim()).filter(Boolean);

  const looksLikeStreet = (segment: string) => {
    const tokens = normalizeText(segment).split(' ');
    if (!tokens.some(t => /^\d+$/.test(t) || /^\d+[A-Z]*$/.test(t))) return false;
    return tokens.some(t => STREET_SUFFIXES.has(t));
  };

  const named = segments.find(looksLikeStreet);
  if (named) return named;

  // No recognisable suffix — accept a leading segment that at least pairs a
  // number with a word, but never a bare ZIP.
  const first = segments[0];
  if (!first) return null;
  const tokens = normalizeText(first).split(' ');
  const hasNumber = tokens.some(t => /^\d+$/.test(t));
  const hasWord   = tokens.some(t => /^[A-Z]{2,}$/.test(t));
  return hasNumber && hasWord ? first : null;
}

/**
 * Pulls street / city / state / ZIP out of a free-text US address.
 *
 * The ZIP is the part that used to break matching: a naive "first 5 digits" scan
 * reads the house number of "12345 SW 8th St, Miami, FL 33184" as ZIP 12345 —
 * Schenectady, NY — putting the lead 1,100 miles from every Miami cleaner, so it
 * matched nobody. So candidates are validated against the ZIP dataset, checked
 * against the state written in the address, and read from the end, where US
 * addresses actually put the ZIP.
 */
export function parseUsAddress(raw: string): ParsedAddress {
  const normalized = normalizeText(raw ?? '');
  if (!normalized) return { street: null, city: null, state: null, zip: null };

  const stateHit = detectState(normalized);
  const state    = stateHit?.code ?? null;

  // ── ZIP ────────────────────────────────────────────────────────────────────
  const candidates: { zip: string; index: number }[] = [];
  for (const m of normalized.matchAll(/\b(\d{5})(?:-\d{4})?\b/g)) {
    candidates.push({ zip: m[1], index: m.index ?? 0 });
  }

  const usable = candidates.filter(c => {
    // Nothing leads with its ZIP — a 5-digit token at the very start followed by
    // more address is a house number.
    if (c.index === 0 && normalized.length > c.zip.length + 4) return false;
    return lookupZip(c.zip) !== null;
  });

  // When the address names a state, the ZIP has to agree with it. That is what
  // rejects a 5-digit house number that happens to be a real ZIP elsewhere.
  const consistent = state
    ? usable.filter(c => lookupZip(c.zip)!.state === state)
    : usable;

  const pool = consistent.length > 0 ? consistent : (state ? [] : usable);
  const zip  = pool.length > 0 ? pool[pool.length - 1].zip : null;

  // ── City ───────────────────────────────────────────────────────────────────
  // A ZIP names its city exactly, so it wins over anything typed by hand.
  const city = zip
    ? normalizeText(lookupZip(zip)!.city)
    : (state && stateHit ? extractCity(normalized.slice(0, stateHit.start), state) : null);

  return { street: extractStreet(raw ?? ''), city, state, zip };
}

// ─── Offline geocoding ────────────────────────────────────────────────────────

/** Average position of every ZIP in a city — a usable centroid without an API. */
function cityCentroid(city: string, state: string): GeoPoint | null {
  const rows: ZipRecord[] = zipcodes.lookupByName(city, state) ?? [];
  const points = rows.filter(r => typeof r.latitude === 'number' && typeof r.longitude === 'number');
  if (points.length === 0) return null;

  return {
    lat: points.reduce((sum, r) => sum + r.latitude,  0) / points.length,
    lng: points.reduce((sum, r) => sum + r.longitude, 0) / points.length,
  };
}

/**
 * Resolves an address with the bundled dataset only — no network, never fails
 * slowly. This is the baseline every caller can rely on; street-level accuracy
 * is layered on top by geocodeAddress().
 */
export function geocodeAddressOffline(raw: string): GeoResult | null {
  const parsed = parseUsAddress(raw);

  if (parsed.zip) {
    const info = lookupZip(parsed.zip)!;
    return {
      lat: info.latitude, lng: info.longitude,
      zip: parsed.zip, city: info.city, state: info.state,
      precision: 'zip',
    };
  }

  if (parsed.city && parsed.state) {
    const centroid = cityCentroid(parsed.city, parsed.state);
    if (centroid) {
      return { ...centroid, zip: null, city: parsed.city, state: parsed.state, precision: 'city' };
    }
  }

  return null;
}

// ─── Street-level geocoding (Nominatim) ───────────────────────────────────────

const NOMINATIM_TIMEOUT_MS = 4000;
// A street result further than this from the ZIP/city we parsed is a
// mis-geocode, not a refinement — keep the offline answer instead.
const SANITY_RADIUS_MILES  = 60;
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const geocodeCache = new Map<string, { at: number; result: GeoResult | null }>();

async function nominatimForward(parsed: ParsedAddress, raw: string): Promise<GeoPoint | null> {
  const params = new URLSearchParams({ format: 'json', limit: '1', countrycodes: 'us' });

  // A structured query beats free text: it survives the typos and odd casing
  // clients type, because each field is matched on its own.
  if (parsed.street || parsed.city || parsed.state || parsed.zip) {
    if (parsed.street) params.set('street', parsed.street);
    if (parsed.city)   params.set('city',   parsed.city);
    if (parsed.state)  params.set('state',  parsed.state);
    if (parsed.zip)    params.set('postalcode', parsed.zip);
  } else {
    params.set('q', raw);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      signal:  controller.signal,
      headers: {
        // Nominatim's usage policy requires identifying the caller.
        'User-Agent':      'Verliks/1.0 (https://verliks.com)',
        'Accept-Language': 'en-US',
      },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const hit  = Array.isArray(data) ? data[0] : null;
    if (!hit) return null;

    const lat = Number(hit.lat);
    const lng = Number(hit.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    // Timeout, rate limit, or network error — the offline result still stands.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Best available coordinates for a free-text address.
 *
 * Offline resolution runs first so there is always an answer, then a street-level
 * lookup refines it — but only if it lands near the ZIP or city we already parsed.
 * A ZIP centroid can sit several miles from the actual house, which matters at the
 * edge of a cleaner's radius, so the refinement is worth the round trip; being
 * wrong by a whole state is not, hence the sanity check.
 */
export async function geocodeAddress(raw: string): Promise<GeoResult | null> {
  if (!raw?.trim()) return null;

  const key    = normalizeText(raw);
  const cached = geocodeCache.get(key);
  if (cached && Date.now() - cached.at < GEOCODE_CACHE_TTL_MS) return cached.result;

  const parsed  = parseUsAddress(raw);
  const offline = geocodeAddressOffline(raw);

  let result = offline;

  // Only worth a network call when there is a street to place inside the ZIP.
  if (parsed.street) {
    const precise = await nominatimForward(parsed, raw);
    if (precise) {
      const drift = offline
        ? haversineDistance(offline.lat, offline.lng, precise.lat, precise.lng)
        : 0;

      if (!offline || drift <= SANITY_RADIUS_MILES) {
        result = {
          ...precise,
          zip:       offline?.zip   ?? parsed.zip,
          city:      offline?.city  ?? parsed.city,
          state:     offline?.state ?? parsed.state,
          precision: 'street',
        };
      }
    }
  }

  geocodeCache.set(key, { at: Date.now(), result });
  return result;
}

// ─── Stored coordinates ───────────────────────────────────────────────────────

// Coordinates this close to Null Island are a placeholder, not a location.
const NULL_ISLAND_EPSILON = 0.0001;

export function hasRealCoords(lat: number | null | undefined, lng: number | null | undefined): boolean {
  return (
    lat != null && lng != null &&
    Number.isFinite(lat) && Number.isFinite(lng) &&
    (Math.abs(lat) > NULL_ISLAND_EPSILON || Math.abs(lng) > NULL_ISLAND_EPSILON)
  );
}

// Resolve the best available coordinates for a location.
// Prefers stored lat/lng (GPS precision) over ZIP centroid.
// Explicit 0,0 is treated as "not set" — falls through to ZIP.
export function resolveCoords(
  storedLat: number | null | undefined,
  storedLng: number | null | undefined,
  zip: string | null | undefined,
): GeoPoint | null {
  if (hasRealCoords(storedLat, storedLng)) {
    return { lat: storedLat as number, lng: storedLng as number };
  }
  if (zip) return coordsFromZip(zip);
  return null;
}

// ─── Schema safety net ────────────────────────────────────────────────────────

// Add serviceRadiusMiles column to User table if it doesn't exist yet.
// instrumentation.ts already runs this at startup; this is a safety net.
// Always marks as ensured after the first attempt (success or failure) so
// a connection-pool timeout never blocks the wave scheduler loop.
let columnEnsured = false;
export async function ensureRadiusColumn(): Promise<void> {
  if (columnEnsured) return;
  columnEnsured = true; // optimistic — column created by instrumentation.ts at boot
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "serviceRadiusMiles" DOUBLE PRECISION DEFAULT 25
    `);
  } catch {
    // Column likely already exists or a transient pool error occurred — safe to ignore.
  }
}
