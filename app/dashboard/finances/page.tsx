'use client';
// Nenhuma transação ainda
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Icon,
} from '@chakra-ui/react';
import {
  LucideBanknote, LucideReceipt, LucideCheckCircle2,
  LucideStar, LucideTrendingUp, LucideCalendar,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { useLocale } from '@/lib/i18n';

type Transaction = {
  id: string;
  leadFee: number;
  feeStatus: string;
  createdAt: string;
  lead: {
    serviceType: string;
    dateTime: string;
    address: string;
    estimatedMinPrice?: number;
    estimatedMaxPrice?: number;
    status: string;
  };
};

type FinanceData = {
  transactions: Transaction[];
  totalFeesPaid: number;
  totalJobsCompleted: number;
  estimatedEarnings: number;
  ratingAvg: number;
};

export default function FinancesPage() {
  const { locale, t } = useLocale();
  const dateLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  const [data, setData]     = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finances');
      if (res.ok) setData(await res.json());
    } catch {
      // network error — keep current state, do not crash
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statItems = [
    {
      label: t('cleaner.finances.statFeesPaid'),
      value: data ? `$${data.totalFeesPaid.toFixed(2)}` : '—',
      color: '#EF4444',
    },
    {
      label: t('cleaner.finances.statJobs'),
      value: data ? String(data.totalJobsCompleted) : '—',
      color: '#22C55E',
    },
    {
      label: t('cleaner.finances.statEarnings'),
      value: data ? `$${data.estimatedEarnings.toFixed(2)}` : '—',
      color: '#0A80DB',
    },
    {
      label: t('cleaner.finances.statRating'),
      value: data?.ratingAvg ? `${data.ratingAvg.toFixed(1)} ⭐` : '—',
      color: '#F59E0B',
    },
  ];

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <HStack gap={2.5} mb={6}>
          <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading">{t('cleaner.finances.title')}</Heading>
        </HStack>

        <VStack gap={6} align="stretch">

          {/* StatStrip — horizontal bar with 4 metrics and vertical dividers */}
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
                  <Text
                    fontSize="22px"
                    fontWeight={800}
                    fontFamily="heading"
                    color={s.color}
                    letterSpacing="-0.03em"
                    lineHeight={1}>
                    {loading ? '—' : s.value}
                  </Text>
                  <Text
                    fontSize="11px"
                    color="#697386"
                    textTransform="uppercase"
                    fontFamily="heading"
                    letterSpacing="0.07em"
                    mt={1}>
                    {s.label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>

          {/* ROI callout: flat panel, no gradient */}
          {data && data.totalFeesPaid > 0 && (
            <Box bg="#F6F9FC" border="1px solid #E3E8EE" p={5} style={{ borderRadius: 8 }}>
              <HStack gap={3}>
                <Box
                  w="40px" h="40px"
                  bg="white"
                  border="1px solid #E3E8EE"
                  display="flex" alignItems="center" justifyContent="center"
                  flexShrink={0}>
                  <Icon as={LucideTrendingUp} w={5} h={5} color="#0A80DB" />
                </Box>
                <Box>
                  <Text fontWeight="bold" color="slate.800" fontSize="sm">{t('cleaner.finances.roiTitle')}</Text>
                  <Text color="slate.500" fontSize="sm">
                    {t('cleaner.finances.roiPrefix')} <Text as="span" fontWeight="bold" color="red.600">${data.totalFeesPaid.toFixed(0)}</Text>{' '}
                    {t('cleaner.finances.roiMid')}{' '}
                    <Text as="span" fontWeight="black" color="#0A80DB">${data.estimatedEarnings.toFixed(0)}</Text>{' '}
                    {t('cleaner.finances.roiSuffix')}
                    {data.totalFeesPaid > 0 && data.estimatedEarnings > 0 && (
                      <Text as="span" fontWeight="bold" color="#0A80DB">
                        {' '}{t('cleaner.finances.roiReturn', { pct: Math.round((data.estimatedEarnings / data.totalFeesPaid) * 100) })}
                      </Text>
                    )}
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}

          {/* Transactions section panel */}
          <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            {/* Section header */}
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <HStack gap={2}>
                <Text
                  fontSize="10.5px"
                  fontWeight={700}
                  color="#697386"
                  textTransform="uppercase"
                  fontFamily="heading"
                  letterSpacing="0.07em">
                  {t('cleaner.finances.sectionHistory')}
                </Text>
                {data && (
                  <Text
                    style={{ borderRadius: 2, background: '#E3E8EE', padding: '2px 6px', fontSize: 9.5, fontWeight: 700, color: '#64748B' }}>
                    {data.transactions.length}
                  </Text>
                )}
              </HStack>
            </Box>

            {loading ? (
              <Box textAlign="center" py={12} bg="white">
                <Text color="slate.400">{t('cleaner.finances.loading')}</Text>
              </Box>
            ) : !data || data.transactions.length === 0 ? (
              <Box bg="white" p={12} textAlign="center">
                <Icon as={LucideBanknote} w={12} h={12} color="slate.300" mb={3} />
                <Text color="slate.600" fontWeight="bold">{t('cleaner.finances.noTransactions')}</Text>
                <Text color="slate.400" fontSize="sm" mt={1}>
                  {t('cleaner.finances.noTransactionsHint')}
                </Text>
              </Box>
            ) : (
              <VStack gap={0} align="stretch">
                {data.transactions.map((tx, i) => {
                  const isLast = i === data.transactions.length - 1;
                  const leftColor =
                    tx.lead.status === 'COMPLETED' ? '#22C55E' :
                    tx.lead.status === 'ACCEPTED'  ? '#0A80DB' : '#CBD5E1';
                  return (
                    <Box
                      key={tx.id}
                      position="relative"
                      bg="white"
                      px={5}
                      py={4}
                      borderBottom={isLast ? undefined : '1px solid #F1F5F9'}>
                      {/* Left accent strip */}
                      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={leftColor} />

                      <Flex justify="space-between" align="center" gap={4}>
                        <HStack gap={4} flex={1} flexWrap="wrap">
                          {/* Status dot */}
                          <Box
                            w="7px" h="7px" borderRadius="full" flexShrink={0}
                            bg={tx.lead.status === 'COMPLETED' ? '#22C55E' : tx.lead.status === 'ACCEPTED' ? '#0A80DB' : '#CBD5E1'} />

                          <VStack align="start" gap={0.5}>
                            <Text fontWeight="semibold" color="slate.800" fontSize="sm">{tx.lead.serviceType}</Text>
                            <HStack gap={2} color="slate.400" fontSize="xs">
                              <Icon as={LucideCalendar} w={3} h={3} />
                              <Text>
                                {new Date(tx.lead.dateTime).toLocaleDateString(dateLocale, { dateStyle: 'medium' })}
                              </Text>
                              <Text>·</Text>
                              <Text>{tx.lead.address}</Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack align="end" gap={0.5} flexShrink={0}>
                          <Text fontWeight="black" color="red.600" fontSize="sm">
                            − ${tx.leadFee.toFixed(2)}
                          </Text>
                          <Text
                            style={{
                              borderRadius: 2,
                              background: tx.lead.status === 'COMPLETED' ? '#F8FAFC' : '#F1F5F9',
                              padding: '2px 6px',
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: tx.lead.status === 'COMPLETED' ? '#0A80DB' : '#64748B',
                            }}>
                            {tx.lead.status === 'COMPLETED' ? t('cleaner.finances.statusCompleted') :
                             tx.lead.status === 'ACCEPTED' ? t('cleaner.finances.statusInProgress') : tx.lead.status}
                          </Text>
                        </VStack>
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
