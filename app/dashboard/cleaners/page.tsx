'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Flex, VStack, HStack, Text, Heading, Icon, Button, SimpleGrid, Image as ChakraImage,
} from '@chakra-ui/react';
import {
  LucideArrowLeft, LucideStar, LucideMapPin, LucideBadgeCheck, LucideSearch, LucideUserX,
} from 'lucide-react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/lib/i18n';
import { SERVICE_TYPES } from '@/lib/estimate';
import NotificationBell from '@/components/notification-bell';
import LanguageSwitcher from '@/components/language-switcher';

type Cleaner = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  plan: string;
  serviceTypes: string[];
  ratingAvg: number;
  totalJobs: number;
  distanceMiles: number | null;
};

const PLAN_BADGE: Record<string, { label: string; bg: string; color: string } | null> = {
  PRO:     { label: 'Top Cleaner', bg: '#FEF3C7', color: '#92400E' },
  PREMIUM: { label: 'Top Cleaner', bg: '#FEF3C7', color: '#92400E' },
  BASIC:   { label: 'Verified',    bg: '#E9F3F5', color: '#1E3A5F' },
  FREE:    null,
};

function CleanersBrowser() {
  const { locale, t } = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const initialService = params.get('service') ?? '';

  const [service, setService]   = useState(initialService);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchCleaners = useCallback(async (svc: string) => {
    setLoading(true);
    try {
      const qs = svc ? `?service=${encodeURIComponent(svc)}` : '';
      const res = await fetch(`/api/cleaners${qs}`);
      if (res.ok) setCleaners((await res.json()).cleaners ?? []);
    } catch {
      // keep current state
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCleaners(service); }, [service, fetchCleaners]);

  const serviceLabel = (id: string) => {
    const s = SERVICE_TYPES.find(x => x.id === id);
    return s ? (locale === 'pt' ? s.label : s.labelEn) : id;
  };

  return (
    <Box minH="100vh" bg="white">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid #E2E8F0" position="sticky" top={0} zIndex={50}
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <Flex align="center" h="60px" px={{ base: 4, md: 6, lg: 8 }} maxW="1200px" mx="auto" justify="space-between">
          <NextLink href="/dashboard/client" style={{ textDecoration: 'none' }}>
            <HStack gap={2} color="#64748B" _hover={{ color: '#1E3A5F' }} transition="color 0.15s">
              <Icon as={LucideArrowLeft} w={4} h={4} />
              <Text fontSize="13px" fontWeight="500" fontFamily="heading">{t('common.backToHome')}</Text>
            </HStack>
          </NextLink>
          <HStack gap={1.5}>
            <LanguageSwitcher />
            <NotificationBell />
          </HStack>
        </Flex>
      </Box>

      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={7}>
        <Heading size="lg" fontWeight="bold" color="slate.900" fontFamily="heading" mb={1}>
          {t('clientCleaners.title')}
        </Heading>
        <Text color="slate.500" fontSize="sm" mb={6}>{t('clientCleaners.subtitle')}</Text>

        {/* Service filter */}
        <Box mb={6} overflowX="auto" pb={1}>
          <HStack gap={2} minW="max-content">
            <FilterChip active={service === ''} onClick={() => setService('')} label={t('clientCleaners.allServices')} />
            {SERVICE_TYPES.map(s => (
              <FilterChip
                key={s.id}
                active={service === s.id}
                onClick={() => setService(s.id)}
                label={`${s.icon} ${locale === 'pt' ? s.label : s.labelEn}`}
              />
            ))}
          </HStack>
        </Box>

        {loading ? (
          <Box py={16} textAlign="center"><Text color="slate.400" fontFamily="heading">{t('clientCleaners.loading')}</Text></Box>
        ) : cleaners.length === 0 ? (
          <Box py={16} textAlign="center">
            <Icon as={LucideUserX} w={12} h={12} color="slate.300" mb={3} />
            <Text color="slate.600" fontWeight="bold" fontFamily="heading">{t('clientCleaners.emptyTitle')}</Text>
            <Text color="slate.400" fontSize="sm" mt={1}>{t('clientCleaners.emptyHint')}</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {cleaners.map(c => {
              const badge = PLAN_BADGE[c.plan] ?? null;
              const firstName = c.name?.split(' ')[0] ?? 'Cleaner';
              return (
                <Box key={c.id} border="1px solid #E3E8EE" borderRadius="10px" overflow="hidden"
                  display="flex" flexDirection="column" transition="box-shadow 0.15s"
                  _hover={{ boxShadow: '0 4px 14px rgba(30,58,95,0.10)' }}>
                  <Box p={5} flex={1}>
                    <HStack gap={3} align="start">
                      <Box w="52px" h="52px" borderRadius="full" overflow="hidden" flexShrink={0}
                        bg="#E9F3F5" display="flex" alignItems="center" justifyContent="center">
                        {c.avatarUrl ? (
                          <ChakraImage src={c.avatarUrl} alt={firstName} w="full" h="full" objectFit="cover" />
                        ) : (
                          <Text fontSize="20px" fontWeight="700" color="#1E3A5F" fontFamily="heading">
                            {firstName[0]?.toUpperCase()}
                          </Text>
                        )}
                      </Box>
                      <Box flex={1} minW={0}>
                        <HStack gap={1.5}>
                          <Text fontWeight="700" color="slate.800" fontFamily="heading" fontSize="15px" lineClamp={1}>
                            {c.name ?? 'Cleaner'}
                          </Text>
                          <Icon as={LucideBadgeCheck} w={4} h={4} color="#2563EB" flexShrink={0} />
                        </HStack>
                        <HStack gap={2} mt={0.5} flexWrap="wrap">
                          <HStack gap={0.5}>
                            <Icon as={LucideStar} w={3.5} h={3.5} color="#F59E0B" fill="#F59E0B" />
                            <Text fontSize="12.5px" fontWeight="600" color="slate.700">
                              {c.ratingAvg > 0 ? c.ratingAvg.toFixed(1) : t('clientCleaners.newPro')}
                            </Text>
                          </HStack>
                          {c.totalJobs > 0 && (
                            <Text fontSize="12px" color="slate.400">· {t('clientCleaners.jobs', { n: c.totalJobs })}</Text>
                          )}
                        </HStack>
                        {c.distanceMiles !== null && (
                          <HStack gap={1} mt={1} color="slate.400">
                            <Icon as={LucideMapPin} w={3} h={3} />
                            <Text fontSize="11.5px">{t('clientCleaners.milesAway', { n: c.distanceMiles })}</Text>
                          </HStack>
                        )}
                      </Box>
                      {badge && (
                        <Box style={{ background: badge.bg, color: badge.color, borderRadius: 4, padding: '2px 7px', fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </Box>
                      )}
                    </HStack>

                    {c.bio && (
                      <Text fontSize="12.5px" color="slate.500" mt={3} lineClamp={2} lineHeight={1.5}>{c.bio}</Text>
                    )}

                    {c.serviceTypes.length > 0 && (
                      <HStack gap={1.5} mt={3} flexWrap="wrap">
                        {c.serviceTypes.slice(0, 3).map(st => (
                          <Text key={st} style={{ background: '#F1F5F9', color: '#475569', borderRadius: 4, padding: '2px 7px', fontSize: 10.5, fontWeight: 600 }}>
                            {serviceLabel(st)}
                          </Text>
                        ))}
                        {c.serviceTypes.length > 3 && (
                          <Text fontSize="10.5px" color="slate.400">+{c.serviceTypes.length - 3}</Text>
                        )}
                      </HStack>
                    )}
                  </Box>

                  <HStack gap={0} borderTop="1px solid #E3E8EE">
                    <Button flex={1} variant="ghost" borderRadius={0} h="44px" fontSize="13px" fontWeight="600"
                      color="#64748B" _hover={{ bg: '#F8FAFC', color: '#1E3A5F' }}
                      onClick={() => router.push(`/dashboard/profile/${c.id}`)}>
                      {t('clientCleaners.viewProfile')}
                    </Button>
                    <Box w="1px" h="28px" bg="#E3E8EE" />
                    <Button flex={1} variant="ghost" borderRadius={0} h="44px" fontSize="13px" fontWeight="700"
                      color="#1E3A5F" _hover={{ bg: '#E9F3F5' }}
                      onClick={() => router.push(`/request?cleaner=${c.id}&name=${encodeURIComponent(c.name ?? '')}${service ? `&service=${service}` : ''}`)}>
                      {t('clientCleaners.contact')}
                    </Button>
                  </HStack>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <Box as="button" onClick={onClick} px={3.5} py={2} borderRadius="full" flexShrink={0}
      fontSize="12.5px" fontWeight="600" fontFamily="heading" whiteSpace="nowrap" transition="all 0.12s"
      bg={active ? '#1E3A5F' : '#F1F5F9'} color={active ? 'white' : '#64748B'}
      _hover={{ bg: active ? '#172F4D' : '#E2E8F0' }}>
      {label}
    </Box>
  );
}

export default function CleanersPage() {
  return (
    <Suspense>
      <CleanersBrowser />
    </Suspense>
  );
}
