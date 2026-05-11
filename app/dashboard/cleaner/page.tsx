'use client';
// Nenhum pedido disponível
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Flex,
  Icon,
} from '@chakra-ui/react';
import {
  LucideMapPin,
  LucideCalendar,
  LucideUser,
  LucideCheckCircle2,
  LucideRefreshCw,
  LucideInbox,
  LucideBriefcase,
  LucideBanknote,
  LucideClock,
  LucideMessageCircle,
} from 'lucide-react';
import { EXTRAS, FREQUENCY_OPTIONS } from '@/lib/estimate';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

type Lead = {
  id: string;
  serviceType: string;
  address: string;
  dateTime: string;
  status: string;
  notes?: string;
  client?: { name: string } | null;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  extras?: string[];
  frequency?: string;
  estimatedMinPrice?: number;
  estimatedMaxPrice?: number;
  estimatedHours?: number;
};

type MyConversation = {
  id: string;
  status: string;
  lead: Lead & { client: { name: string } | null };
};

export default function CleanerDashboard() {
  const router = useRouter();
  const [available, setAvailable]       = useState<Lead[]>([]);
  const [accepted, setAccepted]         = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<MyConversation[]>([]);
  const [responding, setResponding]     = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [showHistory, setShowHistory]   = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads/available');
      if (res.ok) {
        const data = await res.json();
        setAvailable(data.available);
        setAccepted(data.accepted);
        setConversations(data.conversations ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleRespond = async (leadId: string) => {
    setResponding(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/respond`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        if (data.alreadyResponded) {
          router.push(`/dashboard/chat/${data.conversationId}`);
        } else {
          toaster.create({
            title: `Lead aceito! Taxa R$ ${data.leadFee} cobrada.`,
            description: 'Agora você pode conversar com o cliente.',
            type: 'success',
          });
          router.push(`/dashboard/chat/${data.conversationId}`);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toaster.create({ title: error.message, type: 'error' });
    } finally {
      setResponding(null);
    }
  };

  return (
    <Box minH="100vh" bg="slate.50">
      <CleanerNav />

      <Box p={6} maxW="1200px" mx="auto">
        <Flex justify="space-between" align="center" mb={6}>
          <HStack gap={2.5}>
            <Box w="8px" h="8px" bg="green.400" borderRadius="full" boxShadow="0 0 0 3px rgba(34,197,94,0.2)" />
            <Heading size="md" fontWeight="bold" color="slate.900">Pedidos Disponíveis</Heading>
          </HStack>
          <Button size="sm" variant="ghost" color="slate.400" _hover={{ color: 'brand.500', bg: 'brand.50' }}
            onClick={fetchLeads} loading={loading}>
            <Icon as={LucideRefreshCw} w={4} h={4} mr={1} />Atualizar
          </Button>
        </Flex>
        <VStack gap={8} align="stretch">

            {/* ── Available Leads ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <HStack gap={2}>
                    <Icon as={LucideInbox} w={5} h={5} color="brand.500" />
                    <Heading size="sm" color="slate.700">Pedidos Disponíveis</Heading>
                  </HStack>
                  {available.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Badge
                        bg="yellow.100" color="yellow.700"
                        border="1px solid" borderColor="yellow.300"
                        borderRadius="full" px={3} fontSize="xs" fontWeight="bold"
                      >
                        {available.length} novo{available.length > 1 ? 's' : ''}
                      </Badge>
                    </motion.div>
                  )}
                </Flex>

                <AnimatePresence mode="wait">
                  {available.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Box
                        
                        
                        borderColor="slate.200"
                        borderRadius="2xl"
                        p={12}
                        textAlign="center"
                      >
                        <Text fontSize="3xl" mb={2}>📭</Text>
                        <Text color="slate.500" fontWeight="bold">Nenhum pedido disponível</Text>
                        <Text color="slate.400" fontSize="sm" mt={1}>
                          Novos pedidos aparecerão aqui automaticamente.
                        </Text>
                      </Box>
                    </motion.div>
                  ) : (
                    <VStack gap={3} align="stretch">
                      {available.map((lead, i) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: i * 0.07 }}
                        >
                          <Box
                            bg="white"
                            border="1px solid"
                            borderColor="slate.200"
                            borderRadius="2xl"
                            p={5}
                            _hover={{ borderColor: 'brand.200', boxShadow: '0 4px 20px rgba(37,99,235,0.1)', transform: 'translateY(-2px)' }}
                            transition="all 0.2s"
                          >
                            <Flex justify="space-between" align="center" gap={4}>
                              <VStack align="start" gap={2} flex={1}>
                                <HStack gap={2}>
                                  <motion.div
                                    animate={{ scale: [1, 1.12, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                  >
                                    <Badge
                                      bg="yellow.100" color="yellow.700"
                                      border="1px solid" borderColor="yellow.300"
                                      borderRadius="full" px={3} py={0.5}
                                      fontSize="xs" fontWeight="bold"
                                    >
                                      NOVO
                                    </Badge>
                                  </motion.div>
                                  <Text fontWeight="semibold" color="slate.800">
                                    {lead.serviceType}
                                  </Text>
                                </HStack>

                                <HStack gap={4} flexWrap="wrap">
                                  <HStack gap={1} color="slate.500" fontSize="sm">
                                    <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
                                    <Text>{lead.address}</Text>
                                  </HStack>
                                  <HStack gap={1} color="slate.500" fontSize="sm">
                                    <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
                                    <Text>
                                      {new Date(lead.dateTime).toLocaleString('pt-BR', {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                      })}
                                    </Text>
                                  </HStack>
                                </HStack>

                                {/* Property details */}
                                {(lead.bedrooms || lead.squareMeters) && (
                                  <HStack gap={2} flexWrap="wrap">
                                    {lead.bedrooms && (
                                      <Badge bg="slate.50" color="slate.600" borderRadius="full"
                                        px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">
                                        🛏 {lead.bedrooms}q
                                      </Badge>
                                    )}
                                    {lead.bathrooms && (
                                      <Badge bg="slate.50" color="slate.600" borderRadius="full"
                                        px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">
                                        🚿 {lead.bathrooms}ban.
                                      </Badge>
                                    )}
                                    {(lead.squareMeters ?? 0) > 0 && (
                                      <Badge bg="slate.50" color="slate.600" borderRadius="full"
                                        px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="slate.200">
                                        📐 {lead.squareMeters}m²
                                      </Badge>
                                    )}
                                    {lead.frequency && lead.frequency !== 'once' && (
                                      <Badge bg="green.50" color="green.700" borderRadius="full"
                                        px={2} py={0.5} fontSize="xs" border="1px solid" borderColor="green.200">
                                        {FREQUENCY_OPTIONS.find(f => f.id === lead.frequency)?.label}
                                      </Badge>
                                    )}
                                  </HStack>
                                )}

                                {/* Extras */}
                                {lead.extras && lead.extras.length > 0 && (
                                  <HStack gap={1.5} flexWrap="wrap">
                                    {lead.extras.map(exId => {
                                      const ex = EXTRAS.find(e => e.id === exId);
                                      return ex ? (
                                        <Badge key={exId} bg="yellow.50" color="yellow.700"
                                          borderRadius="full" px={2} py={0.5} fontSize="xs"
                                          border="1px solid" borderColor="yellow.200">
                                          {ex.icon} {ex.label}
                                        </Badge>
                                      ) : null;
                                    })}
                                  </HStack>
                                )}

                                {/* Estimate — chave para o profissional decidir */}
                                {lead.estimatedMinPrice && (
                                  <Box bg="linear-gradient(135deg, #EFF6FF, #F0FDF4)"
                                    border="1px solid" borderColor="brand.100"
                                    borderRadius="xl" px={4} py={3}>
                                    <HStack gap={5}>
                                      <HStack gap={1.5}>
                                        <Icon as={LucideBanknote} w={4} h={4} color="green.600" />
                                        <Text fontSize="md" fontWeight="black" color="green.700">
                                          R$ {lead.estimatedMinPrice} – R$ {lead.estimatedMaxPrice}
                                        </Text>
                                      </HStack>
                                      {lead.estimatedHours && (
                                        <HStack gap={1.5}>
                                          <Icon as={LucideClock} w={4} h={4} color="brand.500" />
                                          <Text fontSize="md" fontWeight="black" color="brand.700">
                                            ~{lead.estimatedHours}h
                                          </Text>
                                        </HStack>
                                      )}
                                    </HStack>
                                  </Box>
                                )}

                                {lead.client && (
                                  <HStack gap={1} color="slate.400" fontSize="xs">
                                    <Icon as={LucideUser} w={3} h={3} />
                                    <Text>Cliente: {lead.client.name}</Text>
                                  </HStack>
                                )}

                                {lead.notes && (
                                  <Text color="slate.400" fontSize="xs" fontStyle="italic">
                                    {lead.notes}
                                  </Text>
                                )}
                              </VStack>

                              <motion.div whileTap={{ scale: 0.96 }}>
                                <Button
                                  bg="brand.500"
                                  color="white"
                                  px={5}
                                  borderRadius="xl"
                                  fontWeight="bold"
                                  fontSize="sm"
                                  flexShrink={0}
                                  _hover={{ bg: 'brand.600', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
                                  transition="all 0.2s"
                                  onClick={() => handleRespond(lead.id)}
                                  loading={responding === lead.id}
                                  loadingText="Processando..."
                                >
                                  <Icon as={LucideBanknote} w={4} h={4} mr={1.5} />
                                  Quero este lead
                                </Button>
                              </motion.div>
                            </Flex>
                          </Box>
                        </motion.div>
                      ))}
                    </VStack>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>

            {/* ── My Active Conversations (responded, awaiting client pick) ── */}
            {conversations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <Box>
                  <HStack gap={2} mb={4}>
                    <Icon as={LucideMessageCircle} w={5} h={5} color="brand.500" />
                    <Heading size="sm" color="slate.700">Aguardando Resposta do Cliente</Heading>
                    <Badge
                      bg="blue.100" color="blue.700"
                      border="1px solid" borderColor="blue.200"
                      borderRadius="full" px={2} fontSize="xs" fontWeight="bold"
                    >
                      {conversations.length}
                    </Badge>
                  </HStack>

                  <VStack gap={3} align="stretch">
                    {conversations.map((conv, i) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.07 }}
                      >
                        <Box
                          bg="white"
                          border="1px solid"
                          borderColor="brand.200"
                          borderRadius="2xl"
                          p={5}
                          _hover={{ boxShadow: '0 4px 20px rgba(37,99,235,0.1)' }}
                          transition="all 0.2s"
                          cursor="pointer"
                          onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                        >
                          <Flex justify="space-between" align="center" gap={4}>
                            <VStack align="start" gap={1.5}>
                              <HStack gap={2}>
                                <Badge bg="blue.50" color="blue.700" border="1px solid" borderColor="blue.200"
                                  borderRadius="full" px={3} py={0.5} fontSize="xs" fontWeight="bold">
                                  Proposta enviada
                                </Badge>
                                <Text fontWeight="semibold" color="slate.800">{conv.lead.serviceType}</Text>
                              </HStack>
                              <HStack gap={3} flexWrap="wrap">
                                <HStack gap={1} color="slate.500" fontSize="sm">
                                  <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
                                  <Text>{conv.lead.address}</Text>
                                </HStack>
                                <HStack gap={1} color="slate.500" fontSize="sm">
                                  <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
                                  <Text>
                                    {new Date(conv.lead.dateTime).toLocaleString('pt-BR', {
                                      dateStyle: 'short', timeStyle: 'short',
                                    })}
                                  </Text>
                                </HStack>
                              </HStack>
                              {conv.lead.client && (
                                <HStack gap={1} color="slate.400" fontSize="xs">
                                  <Icon as={LucideUser} w={3} h={3} />
                                  <Text>Cliente: {conv.lead.client.name}</Text>
                                </HStack>
                              )}
                            </VStack>
                            <Button
                              size="sm" bg="brand.500" color="white" borderRadius="xl"
                              fontWeight="bold" flexShrink={0}
                              _hover={{ bg: 'brand.600' }}
                              onClick={e => { e.stopPropagation(); router.push(`/dashboard/chat/${conv.id}`); }}
                            >
                              <Icon as={LucideMessageCircle} w={4} h={4} mr={1.5} />
                              Abrir chat
                            </Button>
                          </Flex>
                        </Box>
                      </motion.div>
                    ))}
                  </VStack>
                </Box>
              </motion.div>
            )}

            {/* ── Active Jobs (IN_REVIEW, ACCEPTED) ── */}
            {accepted.filter(l => l.status !== 'COMPLETED').length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Box>
                  <HStack gap={2} mb={4}>
                    <Icon as={LucideBriefcase} w={5} h={5} color="green.500" />
                    <Heading size="sm" color="slate.700">Meus Trabalhos Aceitos</Heading>
                    <Badge
                      bg="green.100" color="green.700"
                      border="1px solid" borderColor="green.200"
                      borderRadius="full" px={2} fontSize="xs" fontWeight="bold"
                    >
                      {accepted.filter(l => l.status !== 'COMPLETED').length}
                    </Badge>
                  </HStack>

                  <VStack gap={3} align="stretch">
                    {accepted.filter(l => l.status !== 'COMPLETED').map((lead, i) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.07 }}
                      >
                        <Box
                          bg="white"
                          border="1px solid"
                          borderColor="green.200"
                          borderRadius="2xl"
                          p={5}
                          position="relative"
                          overflow="hidden"
                        >
                          <Box
                            position="absolute"
                            left={0} top={0} bottom={0}
                            w="4px"
                            bg="green.400"
                            borderLeftRadius="2xl"
                          />
                          <VStack align="start" gap={2} pl={3}>
                            <HStack gap={2}>
                              <Icon as={LucideCheckCircle2} w={5} h={5} color="green.500" />
                              <Badge
                                bg="green.50" color="green.700"
                                border="1px solid" borderColor="green.200"
                                borderRadius="full" px={3} py={0.5}
                                fontSize="xs" fontWeight="bold"
                              >
                                ACEITO
                              </Badge>
                              <Text fontWeight="semibold" color="slate.800">
                                {lead.serviceType}
                              </Text>
                            </HStack>

                            <HStack gap={4} flexWrap="wrap">
                              <HStack gap={1} color="slate.500" fontSize="sm">
                                <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
                                <Text>{lead.address}</Text>
                              </HStack>
                              <HStack gap={1} color="slate.500" fontSize="sm">
                                <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
                                <Text>
                                  {new Date(lead.dateTime).toLocaleString('pt-BR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })}
                                </Text>
                              </HStack>
                            </HStack>

                            {lead.client && (
                              <HStack gap={1} color="slate.500" fontSize="sm">
                                <Icon as={LucideUser} w={4} h={4} />
                                <Text>
                                  Cliente:{' '}
                                  <Text as="span" fontWeight="semibold">{lead.client.name}</Text>
                                </Text>
                              </HStack>
                            )}

                            {lead.notes && (
                              <Text color="slate.400" fontSize="xs" fontStyle="italic">
                                {lead.notes}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      </motion.div>
                    ))}
                  </VStack>
                </Box>
              </motion.div>
            )}

            {/* ── Completed Jobs History ── */}
            {accepted.filter(l => l.status === 'COMPLETED').length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <Box>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="space-between"
                    px={4} py={3} h="auto"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="slate.200"
                    bg={showHistory ? 'slate.50' : 'white'}
                    color="slate.600"
                    fontWeight="bold"
                    fontSize="sm"
                    _hover={{ bg: 'slate.100', borderColor: 'slate.300' }}
                    onClick={() => setShowHistory(h => !h)}
                    mb={showHistory ? 3 : 0}
                  >
                    <HStack gap={2}>
                      <Icon as={LucideBriefcase} w={4} h={4} color="slate.400" />
                      <Text>Histórico de trabalhos concluídos</Text>
                      <Badge
                        bg="slate.100" color="slate.600"
                        border="1px solid" borderColor="slate.200"
                        borderRadius="full" px={2} fontSize="xs" fontWeight="bold"
                      >
                        {accepted.filter(l => l.status === 'COMPLETED').length}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="slate.400">
                      {showHistory ? '▲ Ocultar' : '▼ Ver histórico'}
                    </Text>
                  </Button>

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <VStack gap={3} align="stretch">
                          {accepted.filter(l => l.status === 'COMPLETED').map((lead, i) => (
                            <motion.div
                              key={lead.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.07 }}
                            >
                              <Box
                                bg="slate.50"
                                border="1px solid"
                                borderColor="slate.200"
                                borderRadius="2xl"
                                p={5}
                                position="relative"
                                overflow="hidden"
                                opacity={0.85}
                              >
                                <Box
                                  position="absolute"
                                  left={0} top={0} bottom={0}
                                  w="4px"
                                  bg="slate.300"
                                  borderLeftRadius="2xl"
                                />
                                <VStack align="start" gap={2} pl={3}>
                                  <HStack gap={2}>
                                    <Icon as={LucideCheckCircle2} w={5} h={5} color="slate.400" />
                                    <Badge
                                      bg="slate.100" color="slate.600"
                                      border="1px solid" borderColor="slate.200"
                                      borderRadius="full" px={3} py={0.5}
                                      fontSize="xs" fontWeight="bold"
                                    >
                                      CONCLUÍDO
                                    </Badge>
                                    <Text fontWeight="semibold" color="slate.600">
                                      {lead.serviceType}
                                    </Text>
                                  </HStack>

                                  <HStack gap={4} flexWrap="wrap">
                                    <HStack gap={1} color="slate.400" fontSize="sm">
                                      <Icon as={LucideMapPin} w={4} h={4} color="slate.400" />
                                      <Text>{lead.address}</Text>
                                    </HStack>
                                    <HStack gap={1} color="slate.400" fontSize="sm">
                                      <Icon as={LucideCalendar} w={4} h={4} color="slate.400" />
                                      <Text>
                                        {new Date(lead.dateTime).toLocaleString('pt-BR', {
                                          dateStyle: 'short',
                                          timeStyle: 'short',
                                        })}
                                      </Text>
                                    </HStack>
                                  </HStack>

                                  {lead.client && (
                                    <HStack gap={1} color="slate.400" fontSize="sm">
                                      <Icon as={LucideUser} w={4} h={4} />
                                      <Text>
                                        Cliente:{' '}
                                        <Text as="span" fontWeight="semibold">{lead.client.name}</Text>
                                      </Text>
                                    </HStack>
                                  )}
                                </VStack>
                              </Box>
                            </motion.div>
                          ))}
                        </VStack>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>
            )}

        </VStack>
      </Box>
    </Box>
  );
}
