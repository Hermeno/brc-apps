'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Icon, Input, Button,
} from '@chakra-ui/react';
import {
  LucideGift, LucideCopy, LucideCheck, LucideUsers, LucideShieldCheck, LucideClock, LucideAlertTriangle,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { useLocale } from '@/lib/i18n';
import { toaster } from '@/lib/toaster';

type Referral = { id: string; name: string | null; isVerified: boolean; createdAt: string };

type ReferralData = {
  link: string;
  qualifyCount: number;
  referralQualifiedCount: number;
  progressInCycle: number;
  freeLeadCredits: number;
  referrals: Referral[];
};

export default function ReferralsPage() {
  const { locale, t } = useLocale();
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        setData(await res.json());
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = `${res.status}${body?.error ? ` — ${body.error}` : ''}`;
        console.error('[referrals] fetch failed:', msg);
        setError(msg);
      }
    } catch (e: any) {
      console.error('[referrals] network error:', e);
      setError(e?.message ?? 'Network error');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.link);
      setCopied(true);
      toaster.create({ title: t('cleaner.referrals.linkCopied'), type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toaster.create({ title: t('cleaner.referrals.copyFailed'), type: 'error' });
    }
  };

  const statItems = [
    { label: t('cleaner.referrals.statReferred'), value: data ? String(data.referrals.length) : '—', color: '#1E3A5F' },
    { label: t('cleaner.referrals.statQualified'), value: data ? String(data.referralQualifiedCount) : '—', color: '#22C55E' },
    { label: t('cleaner.referrals.statCredits'), value: data ? String(data.freeLeadCredits) : '—', color: '#D97706' },
  ];

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <HStack gap={2.5} mb={1}>
          <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading">{t('cleaner.referrals.title')}</Heading>
        </HStack>
        <Text color="slate.500" fontSize="sm" mb={6}>
          {t('cleaner.referrals.subtitle', { n: data?.qualifyCount ?? 3 })}
        </Text>

        <VStack gap={6} align="stretch">

          {error && (
            <Box border="1px solid #FCA5A5" bg="#FEF2F2" p={4} style={{ borderRadius: 8 }}>
              <HStack gap={3} justify="space-between" flexWrap="wrap">
                <HStack gap={2.5}>
                  <Icon as={LucideAlertTriangle} w={4} h={4} color="#DC2626" flexShrink={0} />
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="#991B1B">{t('cleaner.referrals.loadError')}</Text>
                    <Text fontSize="xs" color="#B91C1C" mt={0.5} fontFamily="mono">{error}</Text>
                  </Box>
                </HStack>
                <Button
                  onClick={fetchData}
                  size="sm"
                  bg="#DC2626"
                  color="white"
                  borderRadius="6px"
                  fontSize="12.5px"
                  fontWeight="600"
                  _hover={{ bg: '#B91C1C' }}
                >
                  {t('cleaner.referrals.retry')}
                </Button>
              </HStack>
            </Box>
          )}

          {/* StatStrip */}
          <Box border="1px solid #E3E8EE" bg="white" style={{ borderRadius: 8 }}>
            <Flex>
              {statItems.map((s, i) => (
                <Box
                  key={s.label}
                  flex={1}
                  px={5}
                  py={4}
                  borderRight={i < statItems.length - 1 ? '1px solid #E3E8EE' : undefined}
                  textAlign="center">
                  <Text fontSize="22px" fontWeight={800} fontFamily="heading" color={s.color} letterSpacing="-0.03em" lineHeight={1}>
                    {loading ? '—' : s.value}
                  </Text>
                  <Text fontSize="11px" color="#697386" textTransform="uppercase" fontFamily="heading" letterSpacing="0.07em" mt={1}>
                    {s.label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>

          {/* Referral link panel */}
          <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            <Box bg="#F7F8FA" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <HStack gap={3}>
                <Icon as={LucideGift} w={4} h={4} color="brand.500" />
                <Box>
                  <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                    {t('cleaner.referrals.linkTitle')}
                  </Text>
                  <Text fontSize="xs" color="slate.500">{t('cleaner.referrals.linkSubtitle')}</Text>
                </Box>
              </HStack>
            </Box>
            <Box p={5}>
              <HStack gap={2}>
                <Input
                  readOnly
                  value={data?.link ?? ''}
                  bg="#F8FAFC"
                  border="1.5px solid #E3E8EE"
                  h="40px"
                  borderRadius="8px"
                  fontFamily="mono"
                  fontSize="12.5px"
                  color="#1E3A5F"
                  px={4}
                  onFocus={e => e.target.select()}
                />
                <Button
                  onClick={handleCopy}
                  bg={copied ? '#22C55E' : '#1E3A5F'}
                  color="white"
                  h="40px"
                  px={5}
                  borderRadius="8px"
                  fontWeight="600"
                  fontSize="13px"
                  flexShrink={0}
                  _hover={{ bg: copied ? '#22C55E' : '#172F4D' }}
                  disabled={!data}
                >
                  <Icon as={copied ? LucideCheck : LucideCopy} w={3.5} h={3.5} mr={1.5} />
                  {copied ? t('cleaner.referrals.copied') : t('cleaner.referrals.copyLink')}
                </Button>
              </HStack>

              {/* Progress toward next credit */}
              <Box mt={5}>
                <HStack justify="space-between" mb={1.5}>
                  <Text fontSize="xs" fontWeight="600" color="slate.600">
                    {t('cleaner.referrals.progressLabel')}
                  </Text>
                  <Text fontSize="xs" fontWeight="700" color="#1E3A5F">
                    {data ? `${data.progressInCycle}/${data.qualifyCount}` : '—'}
                  </Text>
                </HStack>
                <Box h="8px" bg="#F1F5F9" borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    bg="#D97706"
                    borderRadius="full"
                    transition="width 0.3s"
                    w={data ? `${(data.progressInCycle / data.qualifyCount) * 100}%` : '0%'}
                  />
                </Box>
                <Text fontSize="xs" color="slate.400" mt={1.5}>
                  {t('cleaner.referrals.progressHint', { n: data?.qualifyCount ?? 3 })}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Referred cleaners list */}
          <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            <Box bg="#F7F8FA" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <HStack gap={2}>
                <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                  {t('cleaner.referrals.listTitle')}
                </Text>
                {data && (
                  <Text style={{ borderRadius: 2, background: '#E3E8EE', padding: '2px 6px', fontSize: 9.5, fontWeight: 700, color: '#64748B' }}>
                    {data.referrals.length}
                  </Text>
                )}
              </HStack>
            </Box>

            {loading ? (
              <Box textAlign="center" py={12} bg="white">
                <Text color="slate.400">{t('cleaner.referrals.loading')}</Text>
              </Box>
            ) : !data || data.referrals.length === 0 ? (
              <Box bg="white" p={12} textAlign="center">
                <Icon as={LucideUsers} w={12} h={12} color="slate.300" mb={3} />
                <Text color="slate.600" fontWeight="bold">{t('cleaner.referrals.empty')}</Text>
                <Text color="slate.400" fontSize="sm" mt={1}>{t('cleaner.referrals.emptyHint')}</Text>
              </Box>
            ) : (
              <VStack gap={0} align="stretch">
                {data.referrals.map((r, i) => {
                  const isLast = i === data.referrals.length - 1;
                  return (
                    <Box key={r.id} position="relative" bg="white" px={5} py={4} borderBottom={isLast ? undefined : '1px solid #F1F5F9'}>
                      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={r.isVerified ? '#22C55E' : '#CBD5E1'} />
                      <Flex justify="space-between" align="center" gap={4}>
                        <VStack align="start" gap={0.5}>
                          <Text fontWeight="semibold" color="slate.800" fontSize="sm">{r.name ?? t('cleaner.referrals.unnamed')}</Text>
                          <Text fontSize="xs" color="slate.400">
                            {new Date(r.createdAt).toLocaleDateString(dateLocale, { dateStyle: 'medium' })}
                          </Text>
                        </VStack>
                        <HStack
                          gap={1.5}
                          style={{
                            borderRadius: 2,
                            background: r.isVerified ? '#F0FDF4' : '#F8FAFC',
                            padding: '3px 8px',
                          }}>
                          <Icon as={r.isVerified ? LucideShieldCheck : LucideClock} w={3} h={3} color={r.isVerified ? '#16A34A' : '#94A3B8'} />
                          <Text fontSize="11px" fontWeight={700} color={r.isVerified ? '#16A34A' : '#64748B'}>
                            {r.isVerified ? t('cleaner.referrals.qualified') : t('cleaner.referrals.pending')}
                          </Text>
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>

        </VStack>
      </Box>
    </Box>
  );
}
