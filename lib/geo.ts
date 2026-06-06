// @ts-ignore — zipcodes has no bundled types
import * as zipcodes from 'zipcodes';
import { prisma } from './prisma';

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

// ZIP → { lat, lng } using the bundled zipcodes dataset (no API needed)
export function coordsFromZip(zip: string): { lat: number; lng: number } | null {
  if (!zip) return null;
  const info = zipcodes.lookup(zip.trim());
  if (!info) return null;
  return { lat: info.latitude, lng: info.longitude };
}

// Resolve the best available coordinates for a location.
// Prefers stored lat/lng (GPS precision) over ZIP centroid.
// Explicit 0,0 is treated as "not set" — falls through to ZIP.
export function resolveCoords(
  storedLat: number | null | undefined,
  storedLng: number | null | undefined,
  zip: string | null | undefined,
): { lat: number; lng: number } | null {
  if (
    storedLat != null && storedLng != null &&
    storedLat !== 0   && storedLng !== 0
  ) {
    return { lat: storedLat, lng: storedLng };
  }
  if (zip) return coordsFromZip(zip);
  return null;
}

// Add serviceRadiusMiles column to User table if it doesn't exist yet.
// Uses a module-level flag so DDL only runs once per process instance.
let columnEnsured = false;
export async function ensureRadiusColumn(): Promise<void> {
  if (columnEnsured) return;
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "serviceRadiusMiles" DOUBLE PRECISION DEFAULT 25
  `);
  columnEnsured = true;
}
