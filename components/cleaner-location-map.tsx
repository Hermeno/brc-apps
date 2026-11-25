'use client';

import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Box, Text } from '@chakra-ui/react';
import { useT } from '@/lib/i18n';

type Place = { lat: number; lng: number; zip: string | null };

/* The cleaner's base on a map: an OpenStreetMap view centered on the saved location
   (no API key, no map library) with a large pin drawn on top, its tip on the point.
   The map itself is not interactive, so the pin can never drift off the location. */
export default function CleanerLocationMap() {
  const t = useT();
  const [place, setPlace] = useState<Place | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const u = d?.user;
        setPlace(u && typeof u.latitude === 'number' && typeof u.longitude === 'number'
          ? { lat: u.latitude, lng: u.longitude, zip: u.zipCode ?? null }
          : null);
      })
      .catch(() => setPlace(null));
  }, []);

  // About 8 km across: the cleaner's own area, at street level.
  const dLat = 0.035, dLng = 0.05;
  const src = place
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${place.lng - dLng},${place.lat - dLat},${place.lng + dLng},${place.lat + dLat}&layer=mapnik`
    : null;

  return (
    <Box bg="white" border="1px solid #DDE5E9" boxShadow="sm" overflow="hidden" style={{ borderRadius: 6 }}>
      <Box px={4} py={3} borderBottom="1px solid #DDE5E9">
        <Text fontSize="sm" fontWeight="700" color="#111418" fontFamily="heading">{t('cleaner.dashboard.mapTitle')}</Text>
        {place?.zip && <Text fontSize="xs" color="#555C66" mt={0.5}>{t('cleaner.dashboard.mapZip', { zip: place.zip })}</Text>}
      </Box>

      <Box position="relative" h="280px" bg="#EDF3F5">
        {src && (
          <>
            <iframe
              src={src}
              title={t('cleaner.dashboard.mapTitle')}
              loading="lazy"
              referrerPolicy="no-referrer"
              tabIndex={-1}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
            />
            <svg width="46" height="58" viewBox="0 0 24 30" aria-hidden="true"
              style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)', filter: 'drop-shadow(0 3px 4px rgba(17, 20, 24, 0.35))' }}>
              <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.2 12 30 12 30s12-9.8 12-18.3C24 5.2 18.6 0 12 0z" fill="#185FC6" />
              <circle cx="12" cy="11.5" r="4.6" fill="#FFFFFF" />
            </svg>
          </>
        )}
        {place === null && (
          <Box position="absolute" inset={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2} px={6} textAlign="center">
            <Text fontSize="sm" color="#555C66">{t('cleaner.dashboard.mapEmpty')}</Text>
          </Box>
        )}
      </Box>

      <Box px={4} py={2.5} borderTop="1px solid #DDE5E9">
        <NextLink href="/dashboard/profile" style={{ fontSize: 13, fontWeight: 600, color: '#185FC6' }}>
          {t('cleaner.dashboard.mapEdit')}
        </NextLink>
      </Box>
    </Box>
  );
}
