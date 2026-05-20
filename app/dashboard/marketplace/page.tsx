'use client';
// Nenhum lead disponível
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Button, Icon,
} from '@chakra-ui/react';
import {
  LucideMapPin, LucideCalendar, LucideUser, LucideRefreshCw,
  LucideBanknote, LucideClock, LucideCompass, LucideZap, LucideUsers,
} from 'lucide-react';
import { EXTRAS, FREQUENCY_OPTIONS } from '@/lib/estimate';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
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

/* ─── Per-lead countdown indicator ───────────────────────────────────── */
function WaveTimer({ lead }: { lead: Lead }) {
  const dist = lead.distributions?.[0];
  const secsLeft = useCountdown(dist?.expiresAt);
  if (!dist) return null;

  const isWave1 = dist.wave === 1;
  const isWave2 = dist.wave === 2;
  const urgent  = secsLeft <= 30 && secsLeft > 0;
  const expired = secsLeft === 0;

  const label = isWave1 ? 'Wave 1 · Exclusive' : isWave2 ? 'Wave 2 · Open' : `Wave ${dist.wave}`;
  const chipBg = urgent ? '#FEF2F2' : '#F8FAFC';
  const chipColor = urgent ? '#B91C1C' : '#0A80DB';

  return (
    <HStack gap={2}>
      <Text
        style={{
          borderRadius: 2,
          background: chipBg,
          padding: '2px 6px',
          fontSize: '9.5px',
          fontWeight: 700,
          color: chipColor,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
        {isWave1 ? '⚡ ' : '👥 '}{label}
      </Text>
      {!expired && (
        <Text fontSize="xs" color={urgent ? 'red.600' : 'slate.500'} fontFamily="mono" fontVariantNumeric="tabular-nums">
          [{Math.floor(secsLeft / 60)}:{String(secsLeft % 60).padStart(2, '0')}]
        </Text>
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
          title: data.alreadyResponded ? 'Already submitted!' : '✓ Interest submitted!',
          description: 'Waiting for the client to choose a cleaner.',
          type: 'success',
        });
        fetchLeads();
        if (data.alreadyResponded && data.conversationId) {
          router.push(`/dashboard/chat/${data.conversationId}`);
        }
      } else if (!data.won) {
        toaster.create({
          title: 'Too slow 😓',
          description: data.message ?? 'Another cleaner accepted first. You were not charged.',
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

  const w1Count = leads.filter(l => l.distributions?.[0]?.wave === 1).length;
  const w2Count = leads.filter(l => l.distributions?.[0]?.wave === 2).length;

  return (
    <Box minH="100vh" bg="#F8FAFC">
      <CleanerNav />
      <Box p={6} maxW="1200px" mx="auto">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading">
            Lead Marketplace
          </Heading>
          <Button size="sm" variant="ghost" color="slate.400" _hover={{ color: 'brand.500', bg: 'brand.50' }}
            onClick={fetchLeads} loading={loading} borderRadius="4px">
            <Icon as={LucideRefreshCw} w={4} h={4} mr={1} />Refresh
          </Button>
        </Flex>

        {/* Stats horizontal strip */}
        <Box bg="white" border="1px solid #E2E8F0" mb={6}>
          <HStack gap={0} divideX="1px">
            <Box px={6} py={4} flex={1}>
              <Text
                fontSize="10.5px" fontWeight={700} color="#94A3B8"
                textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading" mb={1}>
                Available
              </Text>
              <Text fontSize="2xl" fontWeight="black" color="slate.900" fontFamily="heading" letterSpacing="-0.03em">
                {leads.length}
              </Text>
            </Box>
            <Box px={6} py={4} flex={1}>
              <Text
                fontSize="10.5px" fontWeight={700} color="#94A3B8"
                textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading" mb={1}>
                Wave 1 Exclusive
              </Text>
              <Text fontSize="2xl" fontWeight="black" color="#0A80DB" fontFamily="heading" letterSpacing="-0.03em">
                {w1Count}
              </Text>
            </Box>
            <Box px={6} py={4} flex={1}>
              <Text
                fontSize="10.5px" fontWeight={700} color="#94A3B8"
                textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading" mb={1}>
                Wave 2 Competitive
              </Text>
              <Text fontSize="2xl" fontWeight="black" color="#0A80DB" fontFamily="heading" letterSpacing="-0.03em">
                {w2Count}
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Section panel */}
        <Box border="1px solid #E2E8F0">
          <Box bg="#F8FAFC" px={5} py={3} borderBottom="1px solid #E2E8F0">
            <Text fontSize="10.5px" fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
              Available leads
            </Text>
          </Box>

          {leads.length === 0 ? (
            <Box p={16} textAlign="center">
              <Icon as={LucideCompass} w={12} h={12} color="slate.300" mb={4} />
              <Text color="slate.600" fontWeight="bold" fontSize="lg">No leads available</Text>
              <Text color="slate.400" fontSize="sm" mt={1}>
                Leads arrive automatically as clients submit requests.
              </Text>
            </Box>
          ) : (
            <VStack gap={0} align="stretch">
              {leads.map((lead, i) => {
                const dist  = lead.distributions?.[0];
                const wave  = dist?.wave ?? 0;
                const isW1  = wave === 1;
                const accentColor = isW1 ? '#0A80DB' : '#7C3AED';

                return (
                  <Box
                    key={lead.id}
                    position="relative"
                    borderBottom={i < leads.length - 1 ? '1px solid #E2E8F0' : undefined}
                    bg="white"
                    _hover={{ bg: '#FAFBFD' }}
                    transition="background 0.15s">

                    {/* Left accent strip */}
                    <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accentColor} />

                    <Box pl={6} pr={6} py={5}>
                      <Flex justify="space-between" align="start" gap={4}>
                        <VStack align="start" gap={3} flex={1}>

                          {/* Wave indicator + timer */}
                          <WaveTimer lead={lead} />

                          <Text fontWeight="black" fontSize="lg" color="slate.900" fontFamily="heading">
                            {lead.serviceType}
                          </Text>

                          <HStack gap={5} flexWrap="wrap">
                            <HStack gap={1.5} color="slate.500" fontSize="sm">
                              <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
                              <Text>{lead.address}</Text>
                            </HStack>
                            <HStack gap={1.5} color="slate.500" fontSize="sm">
                              <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
                              <Text>
                                {new Date(lead.dateTime).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
                              </Text>
                            </HStack>
                          </HStack>

                          {/* Property inline text */}
                          {(lead.bedrooms || lead.squareMeters) && (
                            <HStack gap={3} flexWrap="wrap">
                              {lead.bedrooms && (
                                <Text fontSize="xs" color="slate.600">🛏 {lead.bedrooms}bd</Text>
                              )}
                              {lead.bathrooms && (
                                <Text fontSize="xs" color="slate.600">🚿 {lead.bathrooms}ba</Text>
                              )}
                              {(lead.squareMeters ?? 0) > 0 && (
                                <Text fontSize="xs" color="slate.600">📐 {lead.squareMeters}m²</Text>
                              )}
                              {lead.frequency && lead.frequency !== 'once' && (
                                <Text
                                  fontSize="xs"
                                  style={{
                                    borderRadius: 2,
                                    background: '#F8FAFC',
                                    padding: '2px 6px',
                                    fontSize: '9.5px',
                                    fontWeight: 700,
                                    color: '#0A80DB',
                                  }}>
                                  🔄 {FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.labelEn}
                                </Text>
                              )}
                            </HStack>
                          )}

                          {/* Extras */}
                          {lead.extras && lead.extras.length > 0 && (
                            <HStack gap={3} flexWrap="wrap">
                              {lead.extras.map(exId => {
                                const ex = EXTRAS.find(e => e.id === exId);
                                return ex ? (
                                  <Text key={exId} fontSize="xs" color="slate.600">{ex.icon} {ex.labelEn}</Text>
                                ) : null;
                              })}
                            </HStack>
                          )}

                          {/* Estimate + Lead price flat */}
                          <HStack gap={5} flexWrap="wrap">
                            {lead.estimatedMinPrice && (
                              <HStack gap={3}>
                                <HStack gap={1.5}>
                                  <Icon as={LucideBanknote} w={4} h={4} color="#0A80DB" />
                                  <Text fontWeight="black" color="#0A80DB" fontSize="sm">
                                    ${lead.estimatedMinPrice}–${lead.estimatedMaxPrice}
                                  </Text>
                                </HStack>
                                {lead.estimatedHours && (
                                  <HStack gap={1}>
                                    <Icon as={LucideClock} w={3.5} h={3.5} color="brand.500" />
                                    <Text fontWeight="bold" color="brand.700" fontSize="sm">~{lead.estimatedHours}h</Text>
                                  </HStack>
                                )}
                              </HStack>
                            )}
                            {lead.leadPrice && (
                              <HStack gap={1.5}>
                                <Text fontSize="xs" color="slate.500">Lead fee:</Text>
                                <Text fontWeight="black" color="#0A80DB" fontSize="sm">
                                  ${lead.leadPrice}
                                </Text>
                              </HStack>
                            )}
                          </HStack>

                          {lead.client && (
                            <HStack gap={1} color="slate.400" fontSize="xs">
                              <Icon as={LucideUser} w={3} h={3} />
                              <Text>Client: {lead.client.name}</Text>
                            </HStack>
                          )}

                          {lead.notes && (
                            <Text color="slate.500" fontSize="sm" fontStyle="italic">"{lead.notes}"</Text>
                          )}
                        </VStack>

                        {/* CTA */}
                        <Button
                          bg="#0A80DB"
                          color="white" px={5} py={7} h="auto"
                          borderRadius="4px" fontWeight="bold" fontSize="sm"
                          flexShrink={0} flexDirection="column" gap={1.5}
                          _hover={{ bg: '#0870C2' }}
                          transition="background 0.15s"
                          onClick={() => handleRespond(lead.id)}
                          loading={responding === lead.id}
                          loadingText="Sending…">
                          <Icon as={isW1 ? LucideZap : LucideUsers} w={5} h={5} />
                          <Text>Accept lead</Text>
                          {lead.leadPrice && (
                            <Text fontSize="10px" opacity={0.8}>${lead.leadPrice}</Text>
                          )}
                        </Button>
                      </Flex>
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  );
}
