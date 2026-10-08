'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, HStack, Input, Text, Icon } from '@chakra-ui/react';
import { LucideMapPin, LucideNavigation, LucideLoader2 } from 'lucide-react';

// Reverse geocode using OpenStreetMap Nominatim (free, no key needed)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'Accept-Language': 'en-US' } },
  );
  const data = await res.json();
  const a = data.address ?? {};
  const street  = [a.house_number, a.road].filter(Boolean).join(' ');
  const city    = a.city || a.town || a.municipality || a.suburb || '';
  const state   = a.state_abbreviation || (a.state ? a.state.slice(0, 2).toUpperCase() : '');
  const zip     = (a.postcode ?? '').replace(/\D/g, '').slice(0, 5);
  return [street, city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /**
   * Whether the server could place the current value: true once it resolved,
   * false once it definitively could not, null while unknown (still typing, or
   * the check has not answered yet). Lets the form refuse to submit an address
   * that is already known to match nobody, without guessing when unsure.
   */
  onResolve?: (ok: boolean | null) => void;
  // Pass any Chakra Input props (bg, border, h, fontSize, etc.)
  inputProps?: Record<string, any>;
};

type Resolved = { zip: string | null; city: string | null; state: string | null };

export function AddressInput({ value, onChange, placeholder, onResolve, inputProps = {} }: Props) {
  const [detecting, setDetecting] = useState(false);
  // Held in a ref so an inline callback from the parent cannot re-trigger the
  // lookup effect on every render.
  const onResolveRef = useRef(onResolve);
  useEffect(() => { onResolveRef.current = onResolve; }, [onResolve]);
  const [resolved, setResolved]   = useState<Resolved | null>(null);
  const [checked, setChecked]     = useState(false);

  // The address is parsed server-side: reading a ZIP out of free text needs the
  // full ZIP dataset (to tell a house number from a ZIP, and to fix a misspelled
  // city), which is far too large to ship to the browser. Showing the result here
  // lets the client catch a typo that would otherwise send their lead to the
  // wrong county — the exact failure that leaves a booking matched to nobody.
  useEffect(() => {
    const address = value.trim();
    if (address.length < 5) { setResolved(null); setChecked(false); onResolveRef.current?.(null); return; }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/geo/resolve', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ address }),
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setResolved(data.resolved ? { zip: data.zip, city: data.city, state: data.state } : null);
        setChecked(true);
        onResolveRef.current?.(!!data.resolved);
      } catch {
        // Offline or rate-limited — stay quiet rather than showing a false warning.
      }
    }, 500);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [value]);

  const handleChange = (v: string) => {
    onChange(v);
    setChecked(false);
    onResolveRef.current?.(null);
  };

  const detect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const formatted = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onChange(formatted);
          // The effect above re-resolves the new value; no local parsing needed.
        } catch {}
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const zip      = resolved?.zip;
  const place    = [resolved?.city, resolved?.state].filter(Boolean).join(', ');
  // No length guard: a bare ZIP is 5 characters, and suppressing the warning for
  // short values is exactly what let a mistyped ZIP through with no feedback at
  // all. `checked` already means the server has answered for this value.
  const showHint = checked && !resolved;

  return (
    <Box>
      <HStack gap={2} align="stretch">
        <Input
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder ?? '123 Main St, Miami, FL 33101'}
          flex={1}
          {...inputProps}
        />
        {/* GPS detect button */}
        <Box
          as="button"
          onClick={detect}
          _disabled={{ opacity: 0.6 }}
          aria-disabled={detecting}
          flexShrink={0}
          w="44px"
          display="flex" alignItems="center" justifyContent="center"
          border="1px solid"
          borderColor={detecting ? 'brand.300' : '#E2E8F0'}
          bg={detecting ? 'brand.50' : 'white'}
          cursor={detecting ? 'default' : 'pointer'}
          title="Detect my location"
          style={{ borderRadius: 4, transition: 'all 0.15s', height: (inputProps.h ?? '44px') }}
          _hover={{ borderColor: '#185FC6', color: '#185FC6' }}
        >
          <Icon
            as={detecting ? LucideLoader2 : LucideNavigation}
            w="15px" h="15px"
            color={detecting ? 'brand.500' : 'slate.400'}
            style={detecting ? { animation: 'spin 1s linear infinite' } : {}}
          />
        </Box>
      </HStack>

      {/* What the matching engine understood from this address */}
      {resolved ? (
        <HStack gap={1.5} mt={1.5}>
          <Icon as={LucideMapPin} w="11px" h="11px" color="#185FC6" />
          <Text fontSize="11px" color="#185FC6" fontWeight="600" fontFamily="heading">
            {place}{zip ? ` ${zip}` : ''} — cleaners in your area will be notified
          </Text>
        </HStack>
      ) : showHint ? (
        <HStack gap={1.5} mt={1.5}>
          <Icon as={LucideMapPin} w="11px" h="11px" color="#D97706" />
          <Text fontSize="11px" color="#D97706" fontFamily="heading">
            We could not place this address. Check the ZIP code, or add the city and state.
          </Text>
        </HStack>
      ) : null}
    </Box>
  );
}
