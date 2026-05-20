'use client';

import { useState } from 'react';
import { Box, HStack, Input, Text, Icon } from '@chakra-ui/react';
import { LucideMapPin, LucideNavigation, LucideLoader2 } from 'lucide-react';

// Extract 5-digit US ZIP from any address string
function extractZip(s: string): string | null {
  const m = s.match(/\b(\d{5})(?:-\d{4})?\b/);
  return m ? m[1] : null;
}

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
  // Pass any Chakra Input props (bg, border, h, fontSize, etc.)
  inputProps?: Record<string, any>;
};

export function AddressInput({ value, onChange, placeholder, inputProps = {} }: Props) {
  const [detecting, setDetecting] = useState(false);
  const [zipLabel, setZipLabel]   = useState<{ zip: string; city: string } | null>(() => {
    const z = extractZip(value);
    return z ? { zip: z, city: '' } : null;
  });

  const handleChange = (v: string) => {
    onChange(v);
    const z = extractZip(v);
    setZipLabel(z ? { zip: z, city: zipLabel?.city ?? '' } : null);
  };

  const detect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const formatted = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onChange(formatted);
          const z = extractZip(formatted);
          // Extract city from formatted string (second segment)
          const city = formatted.split(', ')[1] ?? '';
          setZipLabel(z ? { zip: z, city } : null);
        } catch {}
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const zip  = zipLabel?.zip;
  const city = zipLabel?.city;
  const showHint = !zip && value.trim().length > 8;

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
          _hover={{ borderColor: '#1A7FA0', color: '#1A7FA0' }}
        >
          <Icon
            as={detecting ? LucideLoader2 : LucideNavigation}
            w="15px" h="15px"
            color={detecting ? 'brand.500' : 'slate.400'}
            style={detecting ? { animation: 'spin 1s linear infinite' } : {}}
          />
        </Box>
      </HStack>

      {/* ZIP feedback */}
      {zip ? (
        <HStack gap={1.5} mt={1.5}>
          <Icon as={LucideMapPin} w="11px" h="11px" color="green.500" />
          <Text fontSize="11px" color="green.700" fontWeight="600" fontFamily="heading">
            {city ? `${city} · ` : ''}ZIP {zip} — cleaners in your area will be notified
          </Text>
        </HStack>
      ) : showHint ? (
        <HStack gap={1.5} mt={1.5}>
          <Icon as={LucideMapPin} w="11px" h="11px" color="orange.400" />
          <Text fontSize="11px" color="orange.600" fontFamily="heading">
            Add your ZIP code so we can match you with nearby cleaners
          </Text>
        </HStack>
      ) : null}
    </Box>
  );
}
