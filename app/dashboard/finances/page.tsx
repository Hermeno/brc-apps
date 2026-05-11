'use client';
// Nenhuma transação ainda
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Badge, Icon, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideBanknote, LucideReceipt, LucideCheckCircle2,
  LucideStar, LucideTrendingUp, LucideCalendar,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { motion, AnimatePresence } from 'motion/react';

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

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color: string; icon: any;
}) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl" p={5}
        _hover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} transition="all 0.2s">
        <HStack justify="space-between" mb={3}>
          <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase" letterSpacing="wider">
            {label}
          </Text>
          <Box w="32px" h="32px" bg={`${color.split('.')[0]}.50`} borderRadius="lg"
            display="flex" alignItems="center" justifyContent="center">
            <Icon as={icon} w={4} h={4} color={color} />
          </Box>
        </HStack>
        <Text fontSize="2xl" fontWeight="black" color="slate.900">{value}</Text>
        {sub && <Text fontSize="xs" color="slate.400" mt={0.5}>{sub}</Text>}
      </Box>
    </motion.div>
  );
}

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

  return (
    <Box minH="100vh" bg="slate.50">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <HStack gap={2.5} mb={6}>
          <Box w="8px" h="8px" bg="green.400" borderRadius="full" boxShadow="0 0 0 3px rgba(34,197,94,0.2)" />
          <Heading size="md" fontWeight="bold" color="slate.900">Finanças</Heading>
        </HStack>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <VStack gap={8} align="stretch">

              {/* KPI Cards */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                <StatCard
                  label="Taxas de lead pagas"
                  value={data ? `R$ ${data.totalFeesPaid.toFixed(2)}` : '—'}
                  sub="Total investido"
                  color="red.500"
                  icon={LucideReceipt}
                />
                <StatCard
                  label="Trabalhos concluídos"
                  value={data ? String(data.totalJobsCompleted) : '—'}
                  sub="Total histórico"
                  color="green.500"
                  icon={LucideCheckCircle2}
                />
                <StatCard
                  label="Ganhos estimados"
                  value={data ? `R$ ${data.estimatedEarnings.toFixed(2)}` : '—'}
                  sub="Baseado nas estimativas"
                  color="brand.500"
                  icon={LucideTrendingUp}
                />
                <StatCard
                  label="Avaliação média"
                  value={data?.ratingAvg ? `${data.ratingAvg.toFixed(1)} ⭐` : '—'}
                  sub="Nota dos clientes"
                  color="yellow.500"
                  icon={LucideStar}
                />
              </SimpleGrid>

              {/* ROI callout */}
              {data && data.totalFeesPaid > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                  <Box bg="linear-gradient(135deg, #EFF6FF, #F0FDF4)" border="1px solid" borderColor="brand.100"
                    borderRadius="2xl" p={5}>
                    <HStack gap={3}>
                      <Box w="40px" h="40px" bg="white" borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                        boxShadow="0 2px 8px rgba(0,0,0,0.08)" flexShrink={0}>
                        <Icon as={LucideTrendingUp} w={5} h={5} color="green.500" />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="slate.800" fontSize="sm">Retorno sobre investimento</Text>
                        <Text color="slate.500" fontSize="sm">
                          Para cada <Text as="span" fontWeight="bold" color="red.600">R$ {data.totalFeesPaid.toFixed(0)}</Text> investido em leads,
                          você gerou aproximadamente{' '}
                          <Text as="span" fontWeight="black" color="green.600">R$ {data.estimatedEarnings.toFixed(0)}</Text> em trabalhos.
                          {data.totalFeesPaid > 0 && data.estimatedEarnings > 0 && (
                            <Text as="span" fontWeight="bold" color="brand.600">
                              {' '}({Math.round((data.estimatedEarnings / data.totalFeesPaid) * 100)}% de retorno)
                            </Text>
                          )}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                </motion.div>
              )}

              {/* Transactions list */}
              <Box>
                <HStack gap={2} mb={4}>
                  <Icon as={LucideReceipt} w={5} h={5} color="slate.400" />
                  <Heading size="sm" color="slate.700">Histórico de Transações</Heading>
                  {data && (
                    <Badge bg="slate.100" color="slate.600" borderRadius="full" px={2} fontSize="xs">
                      {data.transactions.length}
                    </Badge>
                  )}
                </HStack>

                <AnimatePresence>
                  {loading ? (
                    <Box textAlign="center" py={12}>
                      <Text color="slate.400">Carregando…</Text>
                    </Box>
                  ) : !data || data.transactions.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Box borderColor="slate.200" borderRadius="2xl" p={12} textAlign="center">
                        <Icon as={LucideBanknote} w={12} h={12} color="slate.300" mb={3} />
                        <Text color="slate.600" fontWeight="bold">Nenhuma transação ainda</Text>
                        <Text color="slate.400" fontSize="sm" mt={1}>
                          Taxas de lead aparecerão aqui quando você aceitar leads.
                        </Text>
                      </Box>
                    </motion.div>
                  ) : (
                    <VStack gap={3} align="stretch">
                      {data.transactions.map((tx, i) => (
                        <motion.div key={tx.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}>
                          <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="xl" px={5} py={4}>
                            <Flex justify="space-between" align="center" gap={4}>
                              <HStack gap={4} flex={1} flexWrap="wrap">
                                {/* Status dot */}
                                <Box w="8px" h="8px" borderRadius="full" flexShrink={0}
                                  bg={tx.lead.status === 'COMPLETED' ? 'green.400' : tx.lead.status === 'ACCEPTED' ? 'brand.400' : 'slate.300'} />

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
                                <Badge
                                  bg={tx.lead.status === 'COMPLETED' ? 'green.50' : 'slate.50'}
                                  color={tx.lead.status === 'COMPLETED' ? 'green.700' : 'slate.500'}
                                  borderRadius="full" px={2} fontSize="10px" fontWeight="bold">
                                  {tx.lead.status === 'COMPLETED' ? 'Concluído' :
                                   tx.lead.status === 'ACCEPTED' ? 'Em andamento' : tx.lead.status}
                                </Badge>
                              </VStack>
                            </Flex>
                          </Box>
                        </motion.div>
                      ))}
                    </VStack>
                  )}
                </AnimatePresence>
              </Box>

            </VStack>
          </motion.div>
      </Box>
    </Box>
  );
}
