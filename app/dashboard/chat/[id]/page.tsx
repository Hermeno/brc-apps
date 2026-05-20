'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Badge, Button,
  Input, Icon, Container,
} from '@chakra-ui/react';
import {
  LucideSend, LucideArrowLeft, LucideCheckCircle, LucideZap,
  LucideBanknote, LucideClock, LucideMapPin, LucideCalendar, LucidePhone,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { toaster } from '@/lib/toaster';

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { name: string; role: string };
};

type ConversationData = {
  id: string;
  status: string;
  leadFee: number;
  feeStatus: string;
  clientId: string;
  cleanerId: string;
  lead: {
    serviceType: string;
    address: string;
    dateTime: string;
    status: string;
    estimatedMinPrice?: number;
    estimatedMaxPrice?: number;
    estimatedHours?: number;
    isInstantBook: boolean;
    clientPhone?: string | null;
  };
  client: { id: string; name: string; phone?: string | null };
  cleaner: { id: string; name: string };
  messages: Message[];
};

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [conv, setConv]     = useState<ConversationData | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [text, setText]     = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (!res.ok) { router.push('/dashboard'); return; }
    const data = await res.json();
    setConv(data.conversation);
    setUserId(data.userId);
  }, [id, router]);

  useEffect(() => {
    fetchMessages();
    // Poll every 4 seconds
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages.length]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setText('');
      await fetchMessages();
    } catch {
      toaster.create({ title: 'Failed to send message', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const confirmCleaner = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/conversations/${id}/confirm`, { method: 'POST' });
      if (res.ok) {
        toaster.create({ title: 'Cleaner confirmed!', description: 'The job has been marked as accepted.', type: 'success' });
        await fetchMessages();
      }
    } finally {
      setConfirming(false);
    }
  };

  if (!conv) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="slate.50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Box w="32px" h="32px" border="3px solid" borderColor="brand.100" borderTopColor="brand.500" borderRadius="full" />
        </motion.div>
      </Flex>
    );
  }

  const isClient   = userId === conv.clientId;
  const isInstant  = conv.lead.isInstantBook;
  const otherName  = isClient ? conv.cleaner.name : conv.client.name;
  const isAccepted = conv.status === 'active' && conv.lead.status === 'ACCEPTED';

  return (
    <Flex h="100vh" bg="slate.50" direction="column">

      {/* ── Top bar ── */}
      <Box
        bg="white" borderBottom="1px solid" borderColor="slate.100"
        px={4} py={3} flexShrink={0}
        boxShadow="0 1px 8px rgba(0,0,0,0.04)"
      >
        <Flex align="center" gap={3} maxW="760px" mx="auto">
          <Button size="sm" variant="ghost" color="slate.500"
            _hover={{ bg: 'slate.100' }} onClick={() => router.back()} px={2}>
            <Icon as={LucideArrowLeft} w={5} h={5} />
          </Button>

          <Box
            w="40px" h="40px" borderRadius="full"
            bgGradient="to-br" gradientFrom="brand.400" gradientTo="brand.600"
            display="flex" alignItems="center" justifyContent="center"
            fontWeight="black" color="white" fontSize="md" flexShrink={0}
          >
            {otherName[0].toUpperCase()}
          </Box>

          <Box flex={1}>
            <HStack gap={2}>
              <Text fontWeight="bold" fontSize="md" color="slate.900">{otherName}</Text>
              {isInstant && (
                <Badge bg="yellow.100" color="yellow.700" borderRadius="full" px={2} fontSize="xs"
                  border="1px solid" borderColor="yellow.300">
                  <Icon as={LucideZap} w={3} h={3} mr={1} />
                  Instant Book
                </Badge>
              )}
              {isAccepted && (
                <Badge bg="green.100" color="green.700" borderRadius="full" px={2} fontSize="xs"
                  border="1px solid" borderColor="green.200">
                  <Icon as={LucideCheckCircle} w={3} h={3} mr={1} />
                  Confirmed
                </Badge>
              )}
            </HStack>
            <Text fontSize="xs" color="slate.400">{conv.lead.serviceType} · {conv.lead.address}</Text>
          </Box>

          {/* Client confirms cleaner */}
          {isClient && !isAccepted && (
            <Button
              size="sm" bg="green.500" color="white" borderRadius="xl" fontWeight="bold"
              _hover={{ bg: 'green.600' }}
              onClick={confirmCleaner} loading={confirming}
              loadingText="Confirming..."
            >
              <Icon as={LucideCheckCircle} w={4} h={4} mr={1} />
              Confirm
            </Button>
          )}
        </Flex>
      </Box>

      {/* ── Client contact card (visible to cleaner when accepted) ── */}
      {!isClient && isAccepted && (conv.client.phone || conv.lead.clientPhone) && (
        <Box bg="green.50" borderBottom="1px solid" borderColor="green.200" px={4} py={2.5} flexShrink={0}>
          <Container maxW="760px">
            <HStack gap={2}>
              <Icon as={LucidePhone} w={4} h={4} color="green.600" />
              <Text fontSize="sm" fontWeight="bold" color="green.800">
                Client contact:
              </Text>
              <Text fontSize="sm" color="green.700" fontWeight="semibold">
                {conv.client.phone || conv.lead.clientPhone}
              </Text>
            </HStack>
          </Container>
        </Box>
      )}

      {/* ── Lead info card ── */}
      <Box bg="slate.50" px={4} py={3} borderBottom="1px solid" borderColor="slate.100" flexShrink={0}>
        <Container maxW="760px">
          <Flex gap={6} align="center" flexWrap="wrap">
            <HStack gap={1.5} color="slate.500" fontSize="sm">
              <Icon as={LucideMapPin} w={4} h={4} color="red.400" />
              <Text>{conv.lead.address}</Text>
            </HStack>
            <HStack gap={1.5} color="slate.500" fontSize="sm">
              <Icon as={LucideCalendar} w={4} h={4} color="brand.400" />
              <Text>
                {new Date(conv.lead.dateTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
              </Text>
            </HStack>
            {conv.lead.estimatedMinPrice && (
              <HStack gap={1.5}>
                <Icon as={LucideBanknote} w={4} h={4} color="green.500" />
                <Text fontSize="sm" fontWeight="bold" color="green.700">
                  ${conv.lead.estimatedMinPrice} – ${conv.lead.estimatedMaxPrice}
                </Text>
              </HStack>
            )}
            {conv.lead.estimatedHours && (
              <HStack gap={1.5}>
                <Icon as={LucideClock} w={4} h={4} color="brand.400" />
                <Text fontSize="sm" fontWeight="bold" color="brand.700">
                  ~{conv.lead.estimatedHours}h
                </Text>
              </HStack>
            )}
            {/* Charge info for cleaner */}
            {!isClient && (
              <Badge
                bg={conv.feeStatus === 'charged' ? 'red.50' : 'slate.100'}
                color={conv.feeStatus === 'charged' ? 'red.600' : 'slate.500'}
                borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="bold"
                border="1px solid"
                borderColor={conv.feeStatus === 'charged' ? 'red.200' : 'slate.200'}
              >
                Lead fee: ${conv.leadFee} — {conv.feeStatus === 'charged' ? 'charged' : 'pending'}
              </Badge>
            )}
          </Flex>
        </Container>
      </Box>

      {/* ── Messages ── */}
      <Box flex={1} overflowY="auto" px={4} py={4}>
        <Container maxW="760px">
          {conv.messages.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="3xl" mb={2}>💬</Text>
              <Text color="slate.500" fontWeight="medium">
                {isClient ? `Start the conversation with ${otherName}` : `Introduce yourself to ${otherName}`}
              </Text>
              <Text color="slate.400" fontSize="sm" mt={1}>
                {!isClient && conv.feeStatus === 'charged'
                  ? `Lead fee of $${conv.leadFee} has been charged.`
                  : 'Be professional and friendly.'}
              </Text>
            </Box>
          ) : (
            <VStack gap={2} align="stretch">
              <AnimatePresence initial={false}>
                {conv.messages.map((msg, i) => {
                  const isMine = msg.senderId === userId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Flex justify={isMine ? 'flex-end' : 'flex-start'}>
                        <Box maxW="72%">
                          {/* Name above first msg in a group */}
                          {(i === 0 || conv.messages[i - 1].senderId !== msg.senderId) && (
                            <Text fontSize="xs" color="slate.400" mb={1}
                              textAlign={isMine ? 'right' : 'left'} px={1}>
                              {isMine ? 'You' : msg.sender.name}
                            </Text>
                          )}
                          <Box
                            bg={isMine ? 'brand.500' : 'white'}
                            color={isMine ? 'white' : 'slate.800'}
                            px={4} py={2.5}
                            borderRadius={isMine ? '2xl 2xl 4px 2xl' : '2xl 2xl 2xl 4px'}
                            boxShadow={isMine ? 'none' : 'sm'}
                            border={isMine ? 'none' : '1px solid'}
                            borderColor="slate.100"
                          >
                            <Text fontSize="sm" lineHeight="relaxed">{msg.content}</Text>
                            <Text
                              fontSize="10px"
                              color={isMine ? 'brand.100' : 'slate.400'}
                              textAlign="right" mt={1}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </Box>
                        </Box>
                      </Flex>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </VStack>
          )}
        </Container>
      </Box>

      {/* ── Input bar ── */}
      <Box
        bg="white" borderTop="1px solid" borderColor="slate.100"
        px={4} py={3} flexShrink={0}
      >
        <Container maxW="760px">
          <HStack gap={3}>
            <Input
              placeholder="Type your message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              bg="slate.50" border="1px solid" borderColor="slate.200"
              borderRadius="2xl" h="12" flex={1}
              _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
              transition="all 0.2s"
            />
            <motion.div whileTap={{ scale: 0.94 }}>
              <Button
                bg={text.trim() ? 'brand.500' : 'slate.200'}
                color={text.trim() ? 'white' : 'slate.400'}
                borderRadius="2xl" h="12" px={4} flexShrink={0}
                _hover={{ bg: text.trim() ? 'brand.600' : 'slate.200' }}
                onClick={sendMessage}
                loading={sending}
                disabled={!text.trim()}
                transition="all 0.2s"
              >
                <Icon as={LucideSend} w={5} h={5} />
              </Button>
            </motion.div>
          </HStack>
        </Container>
      </Box>
    </Flex>
  );
}
