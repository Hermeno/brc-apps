'use client';
// Nenhum lead disponível
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Badge, Button, Icon, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideMapPin, LucideCalendar, LucideUser, LucideRefreshCw,
  LucideBanknote, LucideClock, LucideCompass, LucideZap, LucideUsers,
} from 'lucide-react';
import { EXTRAS, FREQUENCY_OPTIONS } from '@/lib/estimate';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

type Distribution = {
  wave: number;
  status: string;
  expiresAt?: string | null;
};

type Lead = {
  id: string; serviceType: string; address: string; dateTime: string;
  status: string; notes?: string; leadPrice?: number | null;
  client?: { name: string } | null;
  distributions?: Distribution[];
  bedrooms?: number; bathrooms?: number; squareMeters?: number;
  extras?: string[]; frequency?: string;
  estimatedMinPrice?: number; estimatedMaxPrice?: number; estimatedHours?: number;
};

/* ─── Countdown hook ─────────────────────────────────────────────────── */
function useCountdown(expiresAt?: string | null) {
  const [secsLeft, setSecsLeft] = useState<number>(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () =>
      setSecsLeft(Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return secsLeft;
}

/* ─── Per-lead countdown badge ───────────────────────────────────────── */
function WaveTimer({ lead }: { lead: Lead }) {
  const dist = lead.distributions?.[0];
  const secsLeft = useCountdown(dist?.expiresAt);
  if (!dist) return null;

  const isWave1 = dist.wave === 1;
  const isWave2 = dist.wave === 2;
  const urgent  = secsLeft <= 30 && secsLeft > 0;
  const expired = secsLeft === 0;

  const label = isWave1 ? 'Wave 1 · Exclusivo' : isWave2 ? 'Wave 2 · Simultâneo' : `Wave ${dist.wave}`;
  const color = isWave1 ? (urgent ? 'red' : 'brand') : (urgent ? 'red' : 'purple');

  return (
    <HStack gap={2}>
      <motion.div
        animate={urgent ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.8 }}>
        <Badge
          bg={`${color}.50`} color={`${color}.700`}
          border="1px solid" borderColor={`${color}.300`}
          borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
          {isWave1 ? <><Icon as={LucideZap} w={3} h={3} mr={1} /></> : <><Icon as={LucideUsers} w={3} h={3} mr={1} /></>}
          {label}
        </Badge>
      </motion.div>
      {!expired && (
        <Badge
          bg={urgent ? 'red.50' : 'slate.50'}
          color={urgent ? 'red.700' : 'slate.500'}
          border="1px solid"
          borderColor={urgent ? 'red.200' : 'slate.200'}
          borderRadius="full" px={2} py={0.5} fontSize="xs" fontWeight="bold"
          fontVariantNumeric="tabular-nums">
          <Icon as={LucideClock} w={3} h={3} mr={1} />
          {Math.floor(secsLeft / 60)}:{String(secsLeft % 60).padStart(2, '0')}
        </Badge>
      )}
    </HStack>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function MarketplacePage() {
  const router = useRouter();
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads/available');
      if (res.ok) setLeads((await res.json()).available ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => {
    const id = setInterval(fetchLeads, 30000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const handleRespond = async (leadId: string) => {
    setResponding(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/respond`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.won) {
        toaster.create({
          title: data.alreadyResponded ? 'Interesse já registrado!' : '✓ Interesse registrado!',
          description: 'Aguardando o cliente escolher o profissional.',
          type: 'success',
        });
        fetchLeads();
        if (data.alreadyResponded && data.conversationId) {
          router.push(`/dashboard/chat/${data.conversationId}`);
        }
      } else if (!data.won) {
        toaster.create({
          title: 'Você foi mais lento 😓',
          description: data.message ?? 'Outro profissional aceitou primeiro. Você não foi cobrado.',
          type: 'warning',
        });
        fetchLeads();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toaster.create({ title: err.message, type: 'error' });
    } finally { setResponding(null); }
  };

  return (
    <Box minH="100vh" bg="slate.50">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <Flex justify="space-between" align="center" mb={6}>
          <HStack gap={2.5}>
            <Box w="8px" h="8px" bg="yellow.400" borderRadius="full" boxShadow="0 0 0 3px rgba(251,191,36,0.2)" />
            <Heading size="md" fontWeight="bold" color="slate.900">Marketplace de Leads</Heading>
          </HStack>
          <Button size="sm" variant="ghost" color="slate.400" _hover={{ color: 'brand.500', bg: 'brand.50' }}
            onClick={fetchLeads} loading={loading}>
            <Icon as={LucideRefreshCw} w={4} h={4} mr={1} />Atualizar
          </Button>
        </Flex>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Stats */}
            <SimpleGrid columns={3} gap={4} mb={6}>
              <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl" px={5} py={4}>
                <Text fontSize="xs" color="slate.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={1}>Disponíveis</Text>
                <Text fontSize="2xl" fontWeight="black" color="slate.900">{leads.length}</Text>
              </Box>
              <Box bg="white" border="1px solid" borderColor="brand.200" borderRadius="2xl" px={5} py={4}>
                <Text fontSize="xs" color="brand.600" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={1}>Wave 1 (exclusivo)</Text>
                <Text fontSize="2xl" fontWeight="black" color="brand.700">
                  {leads.filter(l => l.distributions?.[0]?.wave === 1).length}
                </Text>
              </Box>
              <Box bg="white" border="1px solid" borderColor="purple.200" borderRadius="2xl" px={5} py={4}>
                <Text fontSize="xs" color="purple.600" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" mb={1}>Wave 2 (competição)</Text>
                <Text fontSize="2xl" fontWeight="black" color="purple.700">
                  {leads.filter(l => l.distributions?.[0]?.wave === 2).length}
                </Text>
              </Box>
            </SimpleGrid>

            <AnimatePresence mode="popLayout">
              {leads.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Box borderColor="slate.200" borderRadius="2xl" p={16} textAlign="center">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                      <Icon as={LucideCompass} w={12} h={12} color="slate.300" mb={4} />
                    </motion.div>
                    <Text color="slate.600" fontWeight="bold" fontSize="lg">Nenhum lead disponível</Text>
                    <Text color="slate.400" fontSize="sm" mt={1}>
                      Os leads chegam automaticamente conforme clientes fazem pedidos.
                    </Text>
                  </Box>
                </motion.div>
              ) : (
                <VStack gap={4} align="stretch">
                  {leads.map((lead, i) => {
                    const dist  = lead.distributions?.[0];
                    const wave  = dist?.wave ?? 0;
                    const isW1  = wave === 1;

                    return (
                      <motion.div key={lead.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        layout>
                        <Box bg="white" border="2px solid"
                          borderColor={isW1 ? 'brand.200' : 'purple.200'}
                          borderRadius="2xl"
                          boxShadow={isW1 ? '0 4px 20px rgba(37,99,235,0.08)' : '0 4px 20px rgba(124,58,237,0.08)'}
                          overflow="hidden"
                          _hover={{ transform: 'translateY(-2px)', boxShadow: isW1 ? '0 8px 30px rgba(37,99,235,0.15)' : '0 8px 30px rgba(124,58,237,0.15)' }}
                          transition="all 0.2s">

                          {/* Top accent bar */}
                          <Box h="3px" bg={isW1 ? 'brand.500' : 'purple.500'} />

                          <Box p={6}>
                            <Flex justify="space-between" align="start" gap={4}>
                              <VStack align="start" gap={3} flex={1}>

                                {/* Wave badge + timer */}
                                <WaveTimer lead={lead} />

                                <HStack gap={2} flexWrap="wrap">
                                  <Text fontWeight="black" fontSize="lg" color="slate.900">{lead.serviceType}</Text>
                                </HStack>

                                <HStack gap={5} flexWrap="wrap">
                                  <HStack gap={1.5} color="slate.500" fontSize="sm">
                                    <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
                                    <Text>{lead.address}</Text>
                                  </HStack>
                                  <HStack gap={1.5} color="slate.500" fontSize="sm">
                                    <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
                                    <Text>
                                      {new Date(lead.dateTime).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                                    </Text>
                                  </HStack>
                                </HStack>

                                {/* Property */}
                                {(lead.bedrooms || lead.squareMeters) && (
                                  <HStack gap={2} flexWrap="wrap">
                                    {lead.bedrooms && (
                                      <Badge bg="slate.50" color="slate.600" borderRadius="full" px={3} py={1}
                                        fontSize="xs" border="1px solid" borderColor="slate.200">
                                        🛏 {lead.bedrooms}q
                                      </Badge>
                                    )}
                                    {lead.bathrooms && (
                                      <Badge bg="slate.50" color="slate.600" borderRadius="full" px={3} py={1}
                                        fontSize="xs" border="1px solid" borderColor="slate.200">
                                        🚿 {lead.bathrooms}ban.
                                      </Badge>
                                    )}
                                    {(lead.squareMeters ?? 0) > 0 && (
                                      <Badge bg="slate.50" color="slate.600" borderRadius="full" px={3} py={1}
                                        fontSize="xs" border="1px solid" borderColor="slate.200">
                                        📐 {lead.squareMeters}m²
                                      </Badge>
                                    )}
                                    {lead.frequency && lead.frequency !== 'once' && (
                                      <Badge bg="green.50" color="green.700" borderRadius="full" px={3} py={1}
                                        fontSize="xs" border="1px solid" borderColor="green.200">
                                        🔄 {FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.label}
                                      </Badge>
                                    )}
                                  </HStack>
                                )}

                                {/* Extras */}
                                {lead.extras && lead.extras.length > 0 && (
                                  <HStack gap={2} flexWrap="wrap">
                                    {lead.extras.map(exId => {
                                      const ex = EXTRAS.find(e => e.id === exId);
                                      return ex ? (
                                        <Badge key={exId} bg="yellow.50" color="yellow.800" borderRadius="full"
                                          px={3} py={1} fontSize="xs" border="1px solid" borderColor="yellow.200">
                                          {ex.icon} {ex.label}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </HStack>
                                )}

                                {/* Estimate + Lead price side by side */}
                                <HStack gap={4} flexWrap="wrap">
                                  {lead.estimatedMinPrice && (
                                    <Box bg="green.50" border="1px solid" borderColor="green.100" borderRadius="xl" px={4} py={2}>
                                      <HStack gap={3}>
                                        <HStack gap={1.5}>
                                          <Icon as={LucideBanknote} w={4} h={4} color="green.600" />
                                          <Text fontWeight="black" color="green.700">
                                            R$ {lead.estimatedMinPrice}–{lead.estimatedMaxPrice}
                                          </Text>
                                        </HStack>
                                        {lead.estimatedHours && (
                                          <HStack gap={1}>
                                            <Icon as={LucideClock} w={3.5} h={3.5} color="brand.500" />
                                            <Text fontWeight="bold" color="brand.700" fontSize="sm">~{lead.estimatedHours}h</Text>
                                          </HStack>
                                        )}
                                      </HStack>
                                    </Box>
                                  )}
                                  {lead.leadPrice && (
                                    <Box bg={isW1 ? 'brand.50' : 'purple.50'} border="1px solid"
                                      borderColor={isW1 ? 'brand.200' : 'purple.200'}
                                      borderRadius="xl" px={4} py={2}>
                                      <Text fontSize="xs" color="slate.500" mb={0.5}>Taxa do lead</Text>
                                      <Text fontWeight="black" color={isW1 ? 'brand.700' : 'purple.700'}>
                                        R$ {lead.leadPrice}
                                      </Text>
                                    </Box>
                                  )}
                                </HStack>

                                {lead.client && (
                                  <HStack gap={1} color="slate.400" fontSize="xs">
                                    <Icon as={LucideUser} w={3} h={3} />
                                    <Text>Cliente: {lead.client.name}</Text>
                                  </HStack>
                                )}

                                {lead.notes && (
                                  <Box bg="slate.50" borderRadius="lg" px={3} py={2}>
                                    <Text color="slate.500" fontSize="sm" fontStyle="italic">"{lead.notes}"</Text>
                                  </Box>
                                )}
                              </VStack>

                              {/* CTA */}
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Button
                                  bg={isW1 ? 'brand.500' : 'purple.600'}
                                  color="white" px={5} py={7} h="auto"
                                  borderRadius="xl" fontWeight="bold" fontSize="sm"
                                  flexShrink={0} flexDirection="column" gap={1.5}
                                  _hover={{
                                    bg: isW1 ? 'brand.600' : 'purple.700',
                                    boxShadow: isW1 ? '0 6px 20px rgba(37,99,235,0.4)' : '0 6px 20px rgba(124,58,237,0.4)',
                                  }}
                                  transition="all 0.2s"
                                  onClick={() => handleRespond(lead.id)}
                                  loading={responding === lead.id}
                                  loadingText="Enviando…">
                                  <Icon as={isW1 ? LucideZap : LucideUsers} w={5} h={5} />
                                  <Text>Aceitar lead</Text>
                                  {lead.leadPrice && (
                                    <Text fontSize="10px" opacity={0.8}>R$ {lead.leadPrice}</Text>
                                  )}
                                </Button>
                              </motion.div>
                            </Flex>
                          </Box>
                        </Box>
                      </motion.div>
                    );
                  })}
                </VStack>
              )}
            </AnimatePresence>
        </motion.div>
      </Box>
    </Box>
  );
}
