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
  const [data, setData]     = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finances');
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statItems = [
    {
      label: 'TAXAS PAGAS',
      value: data ? `R$ ${data.totalFeesPaid.toFixed(2)}` : '—',
      color: '#EF4444',
    },
    {
      label: 'TRABALHOS',
      value: data ? String(data.totalJobsCompleted) : '—',
      color: '#22C55E',
    },
    {
      label: 'GANHOS EST.',
      value: data ? `R$ ${data.estimatedEarnings.toFixed(2)}` : '—',
      color: '#1A7FA0',
    },
    {
      label: 'AVALIAÇÃO',
      value: data?.ratingAvg ? `${data.ratingAvg.toFixed(1)} ⭐` : '—',
      color: '#F59E0B',
    },
  ];

  return (
    <Box minH="100vh" bg="#F8FAFC">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <HStack gap={2.5} mb={6}>
          <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading">Finanças</Heading>
        </HStack>

        <VStack gap={6} align="stretch">

          {/* StatStrip — horizontal bar with 4 metrics and vertical dividers */}
          <Box border="1px solid #E2E8F0" bg="white">
            <Flex>
              {statItems.map((s, i) => (
                <Box
                  key={s.label}
                  flex={1}
                  px={5}
                  py={4}
                  borderRight={i < statItems.length - 1 ? '1px solid #E2E8F0' : undefined}
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
                    color="#94A3B8"
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
            <Box bg="#F8FAFC" border="1px solid #E2E8F0" p={5}>
              <HStack gap={3}>
                <Box
                  w="40px" h="40px"
                  bg="white"
                  border="1px solid #E2E8F0"
                  display="flex" alignItems="center" justifyContent="center"
                  flexShrink={0}>
                  <Icon as={LucideTrendingUp} w={5} h={5} color="green.500" />
                </Box>
                <Box>
                  <Text fontWeight="bold" color="slate.800" fontSize="sm">Retorno sobre investimento</Text>
                  <Text color="slate.500" fontSize="sm">
                    Para cada <Text as="span" fontWeight="bold" color="red.600">R$ {data.totalFeesPaid.toFixed(0)}</Text> investido em leads,
                    você gerou aproximadamente{' '}
                    <Text as="span" fontWeight="black" color="green.600">R$ {data.estimatedEarnings.toFixed(0)}</Text> em trabalhos.
                    {data.totalFeesPaid > 0 && data.estimatedEarnings > 0 && (
                      <Text as="span" fontWeight="bold" color="#1A7FA0">
                        {' '}({Math.round((data.estimatedEarnings / data.totalFeesPaid) * 100)}% de retorno)
                      </Text>
                    )}
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}

          {/* Transactions section panel */}
          <Box border="1px solid #E2E8F0">
            {/* Section header */}
            <Box bg="#F8FAFC" px={5} py={3} borderBottom="1px solid #E2E8F0">
              <HStack gap={2}>
                <Text
                  fontSize="10.5px"
                  fontWeight={700}
                  color="#94A3B8"
                  textTransform="uppercase"
                  fontFamily="heading"
                  letterSpacing="0.07em">
                  HISTÓRICO DE TRANSAÇÕES
                </Text>
                {data && (
                  <Text
                    style={{ borderRadius: 2, background: '#E2E8F0', padding: '2px 6px', fontSize: 9.5, fontWeight: 700, color: '#64748B' }}>
                    {data.transactions.length}
                  </Text>
                )}
              </HStack>
            </Box>

            {loading ? (
              <Box textAlign="center" py={12} bg="white">
                <Text color="slate.400">Carregando…</Text>
              </Box>
            ) : !data || data.transactions.length === 0 ? (
              <Box bg="white" p={12} textAlign="center">
                <Icon as={LucideBanknote} w={12} h={12} color="slate.300" mb={3} />
                <Text color="slate.600" fontWeight="bold">Nenhuma transação ainda</Text>
                <Text color="slate.400" fontSize="sm" mt={1}>
                  Taxas de lead aparecerão aqui quando você aceitar leads.
                </Text>
              </Box>
            ) : (
              <VStack gap={0} align="stretch">
                {data.transactions.map((tx, i) => {
                  const isLast = i === data.transactions.length - 1;
                  const leftColor =
                    tx.lead.status === 'COMPLETED' ? '#22C55E' :
                    tx.lead.status === 'ACCEPTED'  ? '#1A7FA0' : '#CBD5E1';
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
                            bg={tx.lead.status === 'COMPLETED' ? '#22C55E' : tx.lead.status === 'ACCEPTED' ? '#1A7FA0' : '#CBD5E1'} />

                          <VStack align="start" gap={0.5}>
                            <Text fontWeight="semibold" color="slate.800" fontSize="sm">{tx.lead.serviceType}</Text>
                            <HStack gap={2} color="slate.400" fontSize="xs">
                              <Icon as={LucideCalendar} w={3} h={3} />
                              <Text>
                                {new Date(tx.lead.dateTime).toLocaleDateString('pt-BR', { dateStyle: 'medium' })}
                              </Text>
                              <Text>·</Text>
                              <Text>{tx.lead.address}</Text>
                            </HStack>
                          </VStack>
                        </HStack>

                        <VStack align="end" gap={0.5} flexShrink={0}>
                          <Text fontWeight="black" color="red.600" fontSize="sm">
                            − R$ {tx.leadFee.toFixed(2)}
                          </Text>
                          <Text
                            style={{
                              borderRadius: 2,
                              background: tx.lead.status === 'COMPLETED' ? '#DCFCE7' : '#F1F5F9',
                              padding: '2px 6px',
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: tx.lead.status === 'COMPLETED' ? '#15803D' : '#64748B',
                            }}>
                            {tx.lead.status === 'COMPLETED' ? 'Concluído' :
                             tx.lead.status === 'ACCEPTED' ? 'Em andamento' : tx.lead.status}
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
