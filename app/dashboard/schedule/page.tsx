'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Badge, Icon,
} from '@chakra-ui/react';
import {
  LucideMapPin, LucideCalendar, LucideUser, LucideCheckCircle2,
  LucideClock, LucidePhone, LucideStar, LucideCalendarDays,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { motion, AnimatePresence } from 'motion/react';

type Job = {
  id: string; serviceType: string; address: string; dateTime: string;
  status: string; notes?: string; frequency?: string;
  bedrooms?: number; bathrooms?: number; squareMeters?: number;
  estimatedMinPrice?: number; estimatedMaxPrice?: number; estimatedHours?: number;
  client?: { name: string; email: string; phone?: string | null } | null;
  review?: { rating: number; comment?: string | null } | null;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <HStack gap={0.5}>
      {[1, 2, 3, 4, 5].map(s => (
        <Text key={s} fontSize="sm" color={rating >= s ? '#F59E0B' : '#E5E7EB'}>★</Text>
      ))}
    </HStack>
  );
}

export default function SchedulePage() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedule');
      if (res.ok) setJobs((await res.json()).jobs);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const now = new Date();
  const upcoming = jobs.filter(j => j.status === 'ACCEPTED' && new Date(j.dateTime) >= now);
  const today    = jobs.filter(j => j.status === 'ACCEPTED' && new Date(j.dateTime) < now && new Date(j.dateTime).toDateString() === now.toDateString());
  const completed = jobs.filter(j => j.status === 'COMPLETED');

  const Section = ({ title, color, icon, items }: { title: string; color: string; icon: any; items: Job[] }) =>
    items.length === 0 ? null : (
      <Box>
        <HStack gap={2} mb={4}>
          <Icon as={icon} w={5} h={5} color={color} />
          <Heading size="sm" color="slate.700">{title}</Heading>
          <Badge bg={`${color.split('.')[0]}.50`} color={color} borderRadius="full" px={2} fontSize="xs" fontWeight="bold">
            {items.length}
          </Badge>
        </HStack>
        <VStack gap={3} align="stretch">
          <AnimatePresence>
            {items.map((job, i) => {
              const dt = new Date(job.dateTime);
              const isPast = dt < now;
              return (
                <motion.div key={job.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}>
                  <Box bg="white" border="1px solid"
                    borderColor={job.status === 'COMPLETED' ? 'green.200' : 'slate.200'}
                    borderRadius="2xl" overflow="hidden"
                    boxShadow="0 1px 8px rgba(0,0,0,0.04)"
                    _hover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    transition="all 0.2s">
                    {/* Top accent */}
                    <Box h="3px" bg={job.status === 'COMPLETED' ? 'green.400' : isPast ? 'orange.400' : 'brand.400'} />
                    <Box p={5}>
                      <Flex justify="space-between" align="start" gap={4}>
                        <VStack align="start" gap={2.5} flex={1}>

                          <HStack gap={2} flexWrap="wrap">
                            <Badge
                              bg={job.status === 'COMPLETED' ? 'green.50' : 'blue.50'}
                              color={job.status === 'COMPLETED' ? 'green.700' : 'brand.700'}
                              border="1px solid"
                              borderColor={job.status === 'COMPLETED' ? 'green.200' : 'brand.200'}
                              borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                              {job.status === 'COMPLETED' ? '✓ Concluído' : 'Confirmado'}
                            </Badge>
                            <Text fontWeight="bold" color="slate.900">{job.serviceType}</Text>
                          </HStack>

                          <HStack gap={4} flexWrap="wrap">
                            <HStack gap={1.5} color="slate.500" fontSize="sm">
                              <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
                              <Text>{job.address}</Text>
                            </HStack>
                            <HStack gap={1.5} color="slate.500" fontSize="sm">
                              <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
                              <Text fontWeight="semibold" color={isPast ? 'orange.600' : 'slate.700'}>
                                {dt.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                              </Text>
                            </HStack>
                          </HStack>

                          <HStack gap={2} flexWrap="wrap">
                            {job.bedrooms && (
                              <Badge bg="slate.50" color="slate.600" borderRadius="full" px={2} py={0.5}
                                fontSize="xs" border="1px solid" borderColor="slate.200">
                                🛏 {job.bedrooms}q
                              </Badge>
                            )}
                            {job.bathrooms && (
                              <Badge bg="slate.50" color="slate.600" borderRadius="full" px={2} py={0.5}
                                fontSize="xs" border="1px solid" borderColor="slate.200">
                                🚿 {job.bathrooms}ban.
                              </Badge>
                            )}
                            {(job.squareMeters ?? 0) > 0 && (
                              <Badge bg="slate.50" color="slate.600" borderRadius="full" px={2} py={0.5}
                                fontSize="xs" border="1px solid" borderColor="slate.200">
                                📐 {job.squareMeters}m²
                              </Badge>
                            )}
                            {job.estimatedHours && (
                              <Badge bg="brand.50" color="brand.700" borderRadius="full" px={2} py={0.5}
                                fontSize="xs" border="1px solid" borderColor="brand.200">
                                <Icon as={LucideClock} w={3} h={3} mr={1} />~{job.estimatedHours}h
                              </Badge>
                            )}
                          </HStack>

                          {job.client && (
                            <HStack gap={3} bg="slate.50" px={3} py={2} borderRadius="xl" flexWrap="wrap">
                              <HStack gap={1.5} color="slate.600" fontSize="sm">
                                <Icon as={LucideUser} w={4} h={4} />
                                <Text fontWeight="semibold">{job.client.name}</Text>
                              </HStack>
                              {job.client.phone && (
                                <HStack gap={1} color="slate.500" fontSize="sm">
                                  <Icon as={LucidePhone} w={3} h={3} />
                                  <Text>{job.client.phone}</Text>
                                </HStack>
                              )}
                            </HStack>
                          )}

                          {job.review && (
                            <HStack gap={2} bg="yellow.50" px={3} py={2} borderRadius="xl"
                              border="1px solid" borderColor="yellow.200">
                              <Icon as={LucideStar} w={4} h={4} color="yellow.500" />
                              <StarRow rating={job.review.rating} />
                              {job.review.comment && (
                                <Text fontSize="xs" color="yellow.700" fontStyle="italic">
                                  "{job.review.comment}"
                                </Text>
                              )}
                            </HStack>
                          )}

                        </VStack>

                        <Box textAlign="right">
                          {job.estimatedMinPrice && (
                            <Text fontWeight="black" fontSize="lg" color="green.600">
                              R$ {job.estimatedMinPrice}–{job.estimatedMaxPrice}
                            </Text>
                          )}
                          <Text fontSize="xs" color="slate.400" mt={0.5}>
                            {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </VStack>
      </Box>
    );

  return (
    <Box minH="100vh" bg="slate.50">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <HStack gap={2.5} mb={6}>
          <Box w="8px" h="8px" bg="brand.400" borderRadius="full" boxShadow="0 0 0 3px rgba(37,99,235,0.2)" />
          <Heading size="md" fontWeight="bold" color="slate.900">Minha Agenda</Heading>
        </HStack>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <VStack gap={8} align="stretch">

              {loading ? (
                <Box textAlign="center" py={16}>
                  <Text color="slate.400">Carregando agenda…</Text>
                </Box>
              ) : jobs.length === 0 ? (
                <Box  borderColor="slate.200" borderRadius="2xl" p={16} textAlign="center">
                  <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                    <Icon as={LucideCalendarDays} w={14} h={14} color="slate.300" mb={4} />
                  </motion.div>
                  <Text color="slate.600" fontWeight="bold" fontSize="lg">Nenhum trabalho agendado</Text>
                  <Text color="slate.400" fontSize="sm" mt={1}>
                    Aceite leads no Marketplace para ver seus trabalhos aqui.
                  </Text>
                </Box>
              ) : (
                <>
                  <Section title="Hoje" color="orange.500" icon={LucideClock} items={today} />
                  <Section title="Próximos trabalhos" color="brand.500" icon={LucideCalendar} items={upcoming} />
                  <Section title="Histórico" color="green.500" icon={LucideCheckCircle2} items={completed} />
                </>
              )}

            </VStack>
          </motion.div>
      </Box>
    </Box>
  );
}
