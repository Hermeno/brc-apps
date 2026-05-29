'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Badge, Button,
  Input, Icon, Container,
} from '@chakra-ui/react';
import {
  LucideSend, LucideArrowLeft, LucideCheckCircle, LucideZap,
  LucideBanknote, LucideClock, LucideMapPin, LucideCalendar, LucidePhone,
  LucideLock, LucideLoader,
} from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  const [conv, setConv]           = useState<ConversationData | null>(null);
  const [userId, setUserId]       = useState<string>('');
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (!res.ok) { router.push('/dashboard'); return; }
    const data = await res.json();
    setConv(data.conversation);
    setUserId(data.userId);
    setPaymentRequired(!!data.paymentRequired);
  }, [id, router]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Re-check payment status when returning from Stripe checkout
  useEffect(() => {
    if (searchParams.get('paid') === '1') fetchMessages();
  }, [searchParams, fetchMessages]);

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
      toaster.create({ title: 'Message could not be sent. Please try again.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const confirmCleaner = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/conversations/${id}/confirm`, { method: 'POST' });
      if (res.ok) {
        toaster.create({ title: 'Cleaner confirmed!', description: 'Your booking is all set. The job is now accepted.', type: 'success' });
        await fetchMessages();
      }
    } finally {
      setConfirming(false);
    }
  };

  const handlePayLeadFee = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/conversations/${id}/payment`);
      const data = await res.json();
      if (data.alreadyPaid) {
        await fetchMessages();
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      toaster.create({ title: 'Something went wrong with the payment. Please try again.', type: 'error' });
    } finally {
      setPaying(false);
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
  const feePaid    = conv.feeStatus === 'charged' || conv.feeStatus === 'waived';

  // ── Payment wall for cleaner ────────────────────────────────────────────────
  if (!isClient && paymentRequired) {
    const isWaitingForClient = conv.lead.status === 'IN_REVIEW';

    return (
      <Flex h="100vh" bg="slate.50" direction="column">
        {/* Top bar */}
        <Box bg="white" borderBottom="1px solid" borderColor="slate.100" px={4} py={3} flexShrink={0}>
          <Flex align="center" gap={3} maxW="760px" mx="auto">
            <Button size="sm" variant="ghost" color="slate.500" _hover={{ bg: 'slate.100' }} onClick={() => router.back()} px={2}>
              <Icon as={LucideArrowLeft} w={5} h={5} />
            </Button>
            <Box
              w="40px" h="40px" borderRadius="full" bg="brand.500"
              display="flex" alignItems="center" justifyContent="center"
              fontWeight="black" color="white" fontSize="md" flexShrink={0}>
              {otherName[0].toUpperCase()}
            </Box>
            <Box flex={1}>
              <Text fontWeight="bold" fontSize="md" color="slate.900">{otherName}</Text>
              <Text fontSize="xs" color="slate.400">{conv.lead.serviceType} · {conv.lead.address}</Text>
            </Box>
          </Flex>
        </Box>

        {/* Wall content */}
        <Flex flex={1} align="center" justify="center" px={6}>
          <Box bg="white" border="1px solid" borderColor="slate.200" p={10} maxW="440px" w="full" textAlign="center">
            <Box
              w="56px" h="56px" borderRadius="full" bg={isWaitingForClient ? '#EBF5FE' : '#FEF3C7'}
              display="flex" alignItems="center" justifyContent="center" mx="auto" mb={5}>
              <Icon as={isWaitingForClient ? LucideLoader : LucideLock} w={6} h={6}
                color={isWaitingForClient ? '#0A80DB' : '#D97706'} />
            </Box>

            {isWaitingForClient ? (
              <>
                <Text fontWeight="black" fontSize="xl" color="slate.900" mb={2}>
                  Waiting for the client to choose
                </Text>
                <Text color="slate.500" fontSize="sm" lineHeight="1.7">
                  Your interest has been sent. The client is reviewing available cleaners and will pick their top choice shortly.
                  We'll notify you the moment they confirm.
                </Text>
                <Box mt={6} bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" px={4} py={3}>
                  <HStack gap={2} justify="center">
                    <Icon as={LucideBanknote} w={4} h={4} color="#0A80DB" />
                    <Text fontSize="sm" color="slate.600">
                      Lead fee: <Text as="span" fontWeight="black" color="#0A80DB">${conv.leadFee}</Text>
                      {' '}— only charged once the client confirms you
                    </Text>
                  </HStack>
                </Box>
              </>
            ) : (
              <>
                <Text fontWeight="black" fontSize="xl" color="slate.900" mb={2}>
                  One step to unlock your chat
                </Text>
                <Text color="slate.500" fontSize="sm" lineHeight="1.7" mb={6}>
                  Great news — the client has chosen you! Pay the lead fee to open the chat and see the client's contact details.
                </Text>
                <Box bg="#EBF5FE" border="1px solid" borderColor="#A2D3F9" px={5} py={4} mb={6}>
                  <Text fontSize="2xl" fontWeight="black" color="#0A80DB">${conv.leadFee}</Text>
                  <Text fontSize="xs" color="#065594" mt={0.5}>Lead fee — {conv.lead.serviceType}</Text>
                </Box>
                <Button
                  w="full" bg="#0A80DB" color="white" h="44px" borderRadius="4px"
                  fontWeight="bold" fontSize="sm"
                  _hover={{ bg: '#0870C2' }}
                  loading={paying} loadingText="Redirecting to payment…"
                  onClick={handlePayLeadFee}>
                  <Icon as={LucideBanknote} w={4} h={4} mr={2} />
                  Pay ${conv.leadFee} and unlock chat
                </Button>
                <Text fontSize="xs" color="slate.400" mt={3}>Secure checkout via Stripe · USD</Text>
              </>
            )}
          </Box>
        </Flex>
      </Flex>
    );
  }

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
                <Badge bg="#ECFDF5" color="#059669" borderRadius="full" px={2} fontSize="xs"
                  border="1px solid" borderColor="#A7F3D0">
                  <Icon as={LucideZap} w={3} h={3} mr={1} />
                  Instant Book
                </Badge>
              )}
              {isAccepted && (
                <Badge bg="#ECFDF5" color="#059669" borderRadius="full" px={2} fontSize="xs"
                  border="1px solid" borderColor="#A7F3D0">
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
              size="sm" bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
              _hover={{ bg: '#0870C2' }}
              onClick={confirmCleaner} loading={confirming}
              loadingText="Confirming…"
            >
              <Icon as={LucideCheckCircle} w={4} h={4} mr={1} />
              Confirm this cleaner
            </Button>
          )}
        </Flex>
      </Box>

      {/* ── Client contact card (visible to cleaner after fee paid + accepted) ── */}
      {!isClient && feePaid && isAccepted && (conv.client.phone || conv.lead.clientPhone) && (
        <Box bg="#F6F9FC" borderBottom="1px solid" borderColor="#E3E8EE" px={4} py={2.5} flexShrink={0}>
          <Container maxW="760px">
            <HStack gap={2}>
              <Icon as={LucidePhone} w={4} h={4} color="#0A80DB" />
              <Text fontSize="sm" fontWeight="bold" color="#064882">Client's contact:</Text>
              <Text fontSize="sm" color="#0A80DB" fontWeight="semibold">
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
                <Icon as={LucideBanknote} w={4} h={4} color="#0A80DB" />
                <Text fontSize="sm" fontWeight="bold" color="#0A80DB">
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
            {!isClient && (
              <Badge
                bg={feePaid ? '#ECFDF5' : '#F8FAFC'}
                color={feePaid ? '#059669' : '#64748B'}
                borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="bold"
                border="1px solid"
                borderColor={feePaid ? '#A7F3D0' : '#E3E8EE'}
              >
                Lead fee: ${conv.leadFee} — {feePaid ? 'paid ✓' : 'payment pending'}
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
                {isClient ? `Say hello to ${otherName} to kick things off` : `Introduce yourself to ${otherName} and make a great first impression`}
              </Text>
              <Text color="slate.400" fontSize="sm" mt={1}>
                {!isClient && feePaid
                  ? `Your lead fee of $${conv.leadFee} has been paid — you're all set.`
                  : 'Keep it professional and friendly.'}
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
              placeholder="Write a message…"
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
