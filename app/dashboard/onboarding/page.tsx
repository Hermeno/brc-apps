'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Button, Icon,
  Input, Textarea, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideArrowRight, LucideArrowLeft, LucideCheck,
  LucideMapPin, LucideNavigation, LucideZap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { toaster } from '@/lib/toaster';
import { ImageUpload } from '@/components/image-upload';
import NextLink from 'next/link';
import Image from 'next/image';
import { useT } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

const SERVICES = [
  { id: 'Standard Cleaning',          icon: '🧹' },
  { id: 'Deep Cleaning',              icon: '✨' },
  { id: 'Move-In/Out',                icon: '📦' },
  { id: 'Post-Construction',          icon: '🏗️' },
  { id: 'Office',                     icon: '🏢' },
  { id: 'Condo/Apartment',            icon: '🏙️' },
  { id: 'Airbnb',                     icon: '🛎️' },
  { id: 'Window Cleaning',            icon: '🪟' },
  { id: 'Deck Cleaning',              icon: '🪵' },
  { id: 'Pressure Washing',           icon: '💦' },
  { id: 'Gutter Cleaning',            icon: '🍂' },
  { id: 'Flashing Cleaning',          icon: '🏠' },
  { id: 'Tile & Grout Cleaning',      icon: '🔲' },
  { id: 'Home Organizing',            icon: '📋' },
  { id: 'Garage / Basement / Attic',  icon: '🏚️' },
  { id: 'Commercial Cleaning',        icon: '🏬' },
];

const RADIUS_OPTIONS = [5, 10, 15, 20, 25, 35, 50, 60];

function StepDots({ current, steps }: { current: number; steps: string[] }) {
  return (
    <HStack gap={2} justify="center">
      {steps.map((label, i) => (
        <HStack key={label} gap={1.5} align="center">
          <Box
            w={i === current ? '24px' : '8px'} h="8px"
            borderRadius="full"
            bg={i < current ? '#059669' : i === current ? '#0A80DB' : '#CBD5E1'}
            transition="all 0.3s"
          />
          {i < steps.length - 1 && (
            <Box w="16px" h="1px" bg={i < current ? '#059669' : '#E3E8EE'} transition="background 0.3s" />
          )}
        </HStack>
      ))}
    </HStack>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const t = useT();
  const [step, setStep]           = useState(0);
  const [saving, setSaving]       = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [latitude,     setLatitude]     = useState<number | null>(null);
  const [longitude,    setLongitude]    = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [zipCode,      setZipCode]      = useState('');
  const [serviceRadiusMiles, setRadius] = useState(25);
  const [bio,       setBio]       = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const steps = t('onboarding.steps') as unknown as string[];

  useEffect(() => {
    fetch('/api/onboarding')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.user) return;
        const u = d.user;
        if (u.serviceTypes?.length)     setServiceTypes(u.serviceTypes);
        if (u.bio)                      setBio(u.bio);
        if (u.avatarUrl)                setAvatarUrl(u.avatarUrl);
        if (u.serviceRadiusMiles)       setRadius(u.serviceRadiusMiles);
        if (u.zipCode)                  setZipCode(u.zipCode);
        if (u.latitude && u.longitude) {
          setLatitude(u.latitude);
          setLongitude(u.longitude);
          reverseGeocode(u.latitude, u.longitude);
        }
      })
      .catch(() => {});
  }, [router]);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en-US' } }
      );
      const data = await res.json();
      const addr = data.address ?? {};
      const label = [
        addr.suburb || addr.neighbourhood,
        addr.city || addr.town || addr.municipality,
        addr.state,
      ].filter(Boolean).join(', ');
      setLocationLabel(label || data.display_name?.split(',').slice(0, 2).join(',') || '');
    } catch {}
  }, []);

  const detectGPS = () => {
    if (!navigator.geolocation) {
      toaster.create({ title: t('onboarding.locationUnavailable'), description: t('onboarding.locationUnavailableDesc'), type: 'error' });
      return;
    }
    setGeoLoading(true);

    const onSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);
      setGeoLoading(false);
      await reverseGeocode(lat, lng);
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === 1) {
        setGeoLoading(false);
        toaster.create({ title: t('onboarding.locationBlocked'), description: t('onboarding.locationBlockedDesc'), type: 'error' });
      } else if (err.code === 3) {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          () => {
            setGeoLoading(false);
            toaster.create({ title: t('onboarding.locationUnavailable'), description: t('onboarding.locationUnavailableDesc'), type: 'error' });
          },
          { enableHighAccuracy: false, timeout: 30000 },
        );
      } else {
        setGeoLoading(false);
        toaster.create({ title: t('onboarding.locationUnavailable'), description: t('onboarding.locationUnavailableDesc'), type: 'error' });
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: false, timeout: 15000 });
  };

  const saveStep = async (stepName: string, data: Record<string, unknown>) => {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: stepName, data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Save failed');
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 0) {
        if (serviceTypes.length === 0) {
          toaster.create({ title: t('onboarding.errorMinService'), type: 'error' });
          return;
        }
        await saveStep('services', { serviceTypes });
      }
      if (step === 1) {
        if (!latitude && !longitude && !zipCode.trim()) {
          toaster.create({ title: t('onboarding.errorLocation'), type: 'error' });
          return;
        }
        await saveStep('location', { latitude, longitude, zipCode: zipCode.trim() || null, serviceRadiusMiles });
      }
      if (step === 2) {
        await saveStep('bio', { bio: bio.trim() || null, avatarUrl: avatarUrl || null });
      }
      if (step === 3) {
        await saveStep('complete', {});
        router.push('/dashboard/cleaner');
        return;
      }
      setStep(s => s + 1);
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleService = (id: string) =>
    setServiceTypes(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const canProceed =
    step === 0 ? serviceTypes.length > 0 :
    step === 1 ? (!!latitude || !!zipCode.trim()) :
    true;

  const stepNames = Array.isArray(steps) ? steps : ['Services', 'Location', 'Profile', 'Ready'];

  return (
    <Box minH="100vh" bg="white">
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100" px={6} py={4} position="sticky" top={0} zIndex={50}>
        <Flex align="center" justify="space-between" maxW="640px" mx="auto">
          <NextLink href="/">
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          </NextLink>
          <Text fontSize="xs" color="slate.400" fontWeight="semibold">
            {t('onboarding.stepOf', { n: String(step + 1), total: String(stepNames.length), name: stepNames[step] ?? '' })}
          </Text>
          <LanguageSwitcher />
        </Flex>
      </Box>

      <Box maxW="640px" mx="auto" px={6} py={10}>
        <VStack gap={8} align="stretch">

          <StepDots current={step} steps={stepNames} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              {/* ── Step 0: Services ── */}
              {step === 0 && (
                <VStack gap={6} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#0A80DB" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
                      {t('onboarding.stepOf', { n: '1', total: String(stepNames.length), name: stepNames[0] ?? '' })}
                    </Text>
                    <Text fontSize="26px" fontWeight="black" color="slate.900" lineHeight="1.2" mb={1}>
                      {t('onboarding.step0.title')}
                    </Text>
                    <Text color="slate.500" fontSize="sm">
                      {t('onboarding.step0full')}
                    </Text>
                  </Box>

                  <SimpleGrid columns={{ base: 2, sm: 2 }} gap={3}>
                    {SERVICES.map(s => {
                      const selected = serviceTypes.includes(s.id);
                      return (
                        <Box
                          key={s.id} as="button" onClick={() => toggleService(s.id)}
                          bg={selected ? '#EBF5FE' : 'white'}
                          border="2px solid" borderColor={selected ? '#0A80DB' : '#E3E8EE'}
                          p={4} textAlign="left" cursor="pointer" transition="all 0.15s"
                          position="relative"
                          _hover={{ borderColor: selected ? '#0A80DB' : '#A2D3F9', bg: selected ? '#EBF5FE' : '#F8FAFC' }}
                        >
                          {selected && (
                            <Box position="absolute" top={2} right={2}
                              w="18px" h="18px" bg="#0A80DB" borderRadius="full"
                              display="flex" alignItems="center" justifyContent="center">
                              <Icon as={LucideCheck} w={2.5} h={2.5} color="white" />
                            </Box>
                          )}
                          <Text fontSize="xl" mb={1.5}>{s.icon}</Text>
                          <Text fontWeight="bold" fontSize="sm" color="slate.900" mb={0.5}>
                            {t(`services.${s.id}`)}
                          </Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>

                  {serviceTypes.length > 0 && (
                    <Text fontSize="xs" color="#059669" fontWeight="semibold">
                      ✓ {t('onboarding.servicesGood', { n: String(serviceTypes.length) })}
                    </Text>
                  )}
                </VStack>
              )}

              {/* ── Step 1: Location ── */}
              {step === 1 && (
                <VStack gap={6} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#0A80DB" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
                      {t('onboarding.stepOf', { n: '2', total: String(stepNames.length), name: stepNames[1] ?? '' })}
                    </Text>
                    <Text fontSize="26px" fontWeight="black" color="slate.900" lineHeight="1.2" mb={1}>
                      {t('onboarding.step1.title')}
                    </Text>
                    <Text color="slate.500" fontSize="sm">
                      {t('onboarding.step1.subtitle')}
                    </Text>
                  </Box>

                  <Box bg="white" border="1px solid" borderColor="slate.200" p={5}>
                    <Flex justify="space-between" align="center" gap={4}>
                      <VStack align="start" gap={0.5}>
                        <Text fontWeight="bold" fontSize="sm" color="slate.900">{t('onboarding.step1.detectBtn')}</Text>
                        {locationLabel ? (
                          <HStack gap={1.5}>
                            <Icon as={LucideMapPin} w={3.5} h={3.5} color="#059669" />
                            <Text fontSize="xs" color="#059669" fontWeight="semibold">{locationLabel}</Text>
                          </HStack>
                        ) : (
                          <Text fontSize="xs" color="slate.400">{t('onboarding.detectQuick')}</Text>
                        )}
                      </VStack>
                      <Button
                        size="sm" bg={locationLabel ? '#ECFDF5' : '#0A80DB'}
                        color={locationLabel ? '#059669' : 'white'}
                        border={locationLabel ? '1px solid #A7F3D0' : 'none'}
                        borderRadius="4px" fontWeight="bold" flexShrink={0}
                        _hover={{ bg: locationLabel ? '#D1FAE5' : '#0870C2' }}
                        loading={geoLoading} loadingText={t('onboarding.step1.detecting')}
                        onClick={detectGPS}>
                        <Icon as={locationLabel ? LucideCheck : LucideNavigation} w={3.5} h={3.5} mr={1.5} />
                        {locationLabel ? t('onboarding.detected') : t('onboarding.step1.detectBtn')}
                      </Button>
                    </Flex>
                  </Box>

                  <Flex align="center" gap={3}>
                    <Box flex={1} h="1px" bg="slate.200" />
                    <Text fontSize="xs" color="slate.400" fontWeight="semibold">{t('onboarding.orTypeZip')}</Text>
                    <Box flex={1} h="1px" bg="slate.200" />
                  </Flex>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      {t('onboarding.step1.zipLabel')}
                    </Text>
                    <Input
                      placeholder={t('onboarding.step1.zipPlaceholder')}
                      value={zipCode}
                      onChange={e => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      bg="white" border="1px solid" borderColor="slate.200"
                      h="11" borderRadius="4px" fontSize="sm" maxW="180px"
                      _focus={{ borderColor: 'brand.400' }}
                    />
                  </Box>

                  <Box bg="white" border="1px solid" borderColor="slate.200" p={5}>
                    <Flex justify="space-between" align="center" mb={4}>
                      <VStack align="start" gap={0}>
                        <Text fontWeight="bold" fontSize="sm" color="slate.900">{t('onboarding.travelQ')}</Text>
                        <Text fontSize="xs" color="slate.400">{t('onboarding.travelHint')}</Text>
                      </VStack>
                      <Box bg="#EBF5FE" px={3} py={1} borderRadius="4px">
                        <Text fontWeight="black" fontSize="lg" color="#0A80DB">{serviceRadiusMiles} mi</Text>
                      </Box>
                    </Flex>
                    <HStack gap={2} flexWrap="wrap">
                      {RADIUS_OPTIONS.map(r => (
                        <Box
                          key={r} as="button" onClick={() => setRadius(r)}
                          px={3} py={1.5}
                          bg={serviceRadiusMiles === r ? '#0A80DB' : '#F8FAFC'}
                          color={serviceRadiusMiles === r ? 'white' : '#64748B'}
                          border="1px solid" borderColor={serviceRadiusMiles === r ? '#0A80DB' : '#E3E8EE'}
                          borderRadius="4px" fontSize="sm" fontWeight="bold"
                          cursor="pointer" transition="all 0.12s"
                          _hover={{ borderColor: '#0A80DB' }}>
                          {r} mi
                        </Box>
                      ))}
                    </HStack>
                  </Box>
                </VStack>
              )}

              {/* ── Step 2: Bio + Photo ── */}
              {step === 2 && (
                <VStack gap={6} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="#0A80DB" textTransform="uppercase" letterSpacing="0.12em" mb={2}>
                      {t('onboarding.stepOf', { n: '3', total: String(stepNames.length), name: stepNames[2] ?? '' })}
                    </Text>
                    <Text fontSize="26px" fontWeight="black" color="slate.900" lineHeight="1.2" mb={1}>
                      {t('onboarding.step2.title')}
                    </Text>
                    <Text color="slate.500" fontSize="sm">
                      {t('onboarding.step2.subtitle')}
                    </Text>
                  </Box>

                  <Box bg="white" border="1px solid" borderColor="slate.200" p={5}>
                    <Flex align="center" gap={5}>
                      <ImageUpload value={avatarUrl} onChange={setAvatarUrl} shape="circle" size={72} placeholder={t('onboarding.step2.photoLabel')} />
                      <Box flex={1}>
                        <Text fontWeight="bold" color="slate.800" fontSize="sm">{t('onboarding.addPhoto')}</Text>
                        <Text fontSize="xs" color="slate.400" mt={0.5}>{t('onboarding.photoHint')}</Text>
                        {avatarUrl && (
                          <Text fontSize="xs" color="#059669" fontWeight="semibold" mt={1}>✓ {t('onboarding.photoAdded')}</Text>
                        )}
                      </Box>
                    </Flex>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                      {t('onboarding.step2.bioLabel')}
                    </Text>
                    <Textarea
                      placeholder={t('onboarding.step2.bioPlaceholder')}
                      value={bio} onChange={e => setBio(e.target.value)}
                      bg="white" border="1px solid" borderColor="slate.200"
                      borderRadius="4px" fontSize="sm" rows={4} resize="none"
                      _focus={{ borderColor: 'brand.400' }}
                    />
                    <Text fontSize="xs" color="slate.400" mt={1} textAlign="right">{bio.length}/400</Text>
                  </Box>

                  <Button
                    variant="ghost" color="slate.400" fontSize="sm" alignSelf="flex-start"
                    _hover={{ color: 'slate.600' }}
                    onClick={() => setStep(s => s + 1)}>
                    {t('onboarding.skipBtn')} →
                  </Button>
                </VStack>
              )}

              {/* ── Step 3: Done ── */}
              {step === 3 && (
                <VStack gap={6} align="stretch">
                  <Box textAlign="center" py={4}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}>
                      <Box
                        w="72px" h="72px" borderRadius="full" bg="#ECFDF5"
                        border="3px solid #A7F3D0"
                        display="flex" alignItems="center" justifyContent="center" mx="auto" mb={5}>
                        <Icon as={LucideCheck} w={8} h={8} color="#059669" />
                      </Box>
                    </motion.div>
                    <Text fontSize="28px" fontWeight="black" color="slate.900" mb={2}>
                      {t('onboarding.step3.title')}
                    </Text>
                    <Text color="slate.500" fontSize="sm" lineHeight="1.8" maxW="380px" mx="auto">
                      {t('onboarding.step3.subtitle')}
                    </Text>
                  </Box>

                  <SimpleGrid columns={2} gap={3}>
                    <Box bg="white" border="1px solid" borderColor="slate.200" p={4}>
                      <Text fontSize="xs" fontWeight="700" color="slate.400" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                        {t('onboarding.summaryServices')}
                      </Text>
                      <VStack gap={1} align="start">
                        {serviceTypes.slice(0, 3).map(s => (
                          <HStack key={s} gap={1.5}>
                            <Icon as={LucideCheck} w={3} h={3} color="#059669" />
                            <Text fontSize="xs" color="slate.700" fontWeight="semibold">{t(`services.${s}`)}</Text>
                          </HStack>
                        ))}
                        {serviceTypes.length > 3 && (
                          <Text fontSize="xs" color="slate.400">{t('onboarding.moreServices', { n: String(serviceTypes.length - 3) })}</Text>
                        )}
                      </VStack>
                    </Box>

                    <Box bg="white" border="1px solid" borderColor="slate.200" p={4}>
                      <Text fontSize="xs" fontWeight="700" color="slate.400" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                        {t('onboarding.summaryLocation')}
                      </Text>
                      {locationLabel ? (
                        <Text fontSize="xs" color="slate.700" fontWeight="semibold" lineHeight="1.5">{locationLabel}</Text>
                      ) : zipCode ? (
                        <Text fontSize="xs" color="slate.700" fontWeight="semibold">{t('onboarding.zipPrefix')}{zipCode}</Text>
                      ) : null}
                      <HStack gap={1.5} mt={2}>
                        <Icon as={LucideZap} w={3} h={3} color="#0A80DB" />
                        <Text fontSize="xs" color="#0A80DB" fontWeight="bold">{t('onboarding.miRadius', { n: String(serviceRadiusMiles) })}</Text>
                      </HStack>
                    </Box>
                  </SimpleGrid>

                  <Box bg="#EBF5FE" border="1px solid" borderColor="#A2D3F9" p={4}>
                    <HStack gap={3}>
                      <Icon as={LucideZap} w={5} h={5} color="#0A80DB" flexShrink={0} />
                      <Text fontSize="sm" color="#065594" lineHeight="1.6">
                        <Text as="span" fontWeight="bold">{t('onboarding.upsellTitle')}</Text>{' '}
                        {t('onboarding.upsellBody')}
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              )}
            </motion.div>
          </AnimatePresence>

          <Flex justify="space-between" align="center" pt={2}>
            {step > 0 ? (
              <Button variant="ghost" color="slate.500" borderRadius="4px"
                _hover={{ color: 'slate.800', bg: 'slate.100' }}
                onClick={() => setStep(s => s - 1)} disabled={saving}>
                <Icon as={LucideArrowLeft} w={4} h={4} mr={1.5} />
                {t('common.back')}
              </Button>
            ) : (
              <Box />
            )}

            <Button
              bg={step === 3 ? '#059669' : '#0A80DB'}
              color="white" px={7} h="44px" borderRadius="4px" fontWeight="bold"
              _hover={{ bg: step === 3 ? '#047857' : '#0870C2' }}
              loading={saving}
              loadingText={step === 3 ? t('onboarding.launching') : t('common.saving')}
              disabled={!canProceed}
              onClick={handleNext}>
              {step === 3 ? (
                <>
                  <Icon as={LucideZap} w={4} h={4} mr={2} />
                  {t('onboarding.step3.goBtn')}
                </>
              ) : (
                <>
                  {t('common.continue')}
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </>
              )}
            </Button>
          </Flex>

        </VStack>
      </Box>
    </Box>
  );
}
