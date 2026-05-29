'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Button, Icon,
} from '@chakra-ui/react';
import {
  LucideCreditCard, LucideTrash2, LucidePlus, LucideStar,
  LucideShieldCheck,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';

type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
};

const BRAND_LABELS: Record<string, string> = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex',
  discover: 'Discover', elo: 'Elo', hipercard: 'Hipercard',
};

const BRAND_COLORS: Record<string, { bg: string; color: string }> = {
  visa:       { bg: '#1A1F71', color: '#fff' },
  mastercard: { bg: '#EB001B', color: '#fff' },
  amex:       { bg: '#2E77BC', color: '#fff' },
};

function CardIcon({ brand }: { brand: string }) {
  const style = BRAND_COLORS[brand] ?? { bg: '#6B7280', color: '#fff' };
  return (
    <Box
      w="40px" h="26px" borderRadius="md"
      bg={style.bg} display="flex" alignItems="center" justifyContent="center"
      flexShrink={0}>
      <Text color={style.color} fontSize="8px" fontWeight="black" textTransform="uppercase">
        {BRAND_LABELS[brand] ?? brand}
      </Text>
    </Box>
  );
}

function PaymentMethodsContent() {
  const searchParams = useSearchParams();
  const [cards, setCards]         = useState<SavedCard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [adding, setAdding]       = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [settingId, setSettingId]   = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('setup') === '1') {
      toaster.create({ title: 'Card added successfully.', type: 'success' });
    }
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/payment-methods');
      if (res.ok) setCards((await res.json()).paymentMethods ?? []);
    } finally { setLoading(false); }
  };

  const handleAdd = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/stripe/setup', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? 'Error');
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/stripe/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== id));
        toaster.create({ title: 'Card removed from your account.', type: 'success' });
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally { setRemovingId(null); }
  };

  const handleSetDefault = async (id: string) => {
    setSettingId(id);
    try {
      const res = await fetch(`/api/stripe/payment-methods/${id}`, { method: 'POST' });
      if (res.ok) {
        setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
        toaster.create({ title: 'Default card updated. Lead charges will use this card.', type: 'success' });
      } else {
        const err = await res.json();
        throw new Error(err.error);
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
    } finally { setSettingId(null); }
  };

  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />

      <Box p={6} maxW="600px" mx="auto">
        <VStack gap={6} align="stretch">

          {/* Header: flat, no animation */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" fontWeight="black" color="slate.900" fontFamily="heading">
                Payment methods
              </Heading>
              <Text color="slate.500" fontSize="sm" mt={1}>
                Your saved cards are charged automatically when you accept a lead.
              </Text>
            </Box>
            <Button
              bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
              _hover={{ bg: '#0870C2' }}
              loading={adding} loadingText="Redirecting to Stripe..."
              onClick={handleAdd}>
              <Icon as={LucidePlus} w={4} h={4} mr={2} />
              Add a card
            </Button>
          </Flex>

          {/* How it works: flat box, no radius, blue tint */}
          <Box bg="#F6F9FC" border="1px solid #E3E8EE" p={5} style={{ borderRadius: 8 }}>
            <HStack gap={3} align="start">
              <Icon as={LucideShieldCheck} w={5} h={5} color="blue.600" flexShrink={0} mt={0.5} />
              <Box>
                <Text fontWeight="bold" color="blue.800" fontSize="sm">How lead payments work</Text>
                <Text color="blue.700" fontSize="xs" mt={1} lineHeight="1.6">
                  When you accept a lead, the fee is automatically charged to your default card.
                  Your card details are stored securely by Stripe and never touch our servers.
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Cards list: section panel */}
          <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            {/* Section header */}
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <Text
                fontSize="10.5px"
                fontWeight={700}
                color="#697386"
                textTransform="uppercase"
                fontFamily="heading"
                letterSpacing="0.07em">
                SAVED CARDS
              </Text>
            </Box>

            {loading ? (
              <VStack gap={0} py={4} bg="white">
                {[1, 2].map(i => (
                  <Box key={i} h="64px" bg="slate.100" w="full"
                    borderBottom="1px solid #F1F5F9"
                    animation="pulse 1.5s ease-in-out infinite" />
                ))}
              </VStack>
            ) : cards.length === 0 ? (
              <VStack py={10} gap={3} textAlign="center" bg="white">
                <Box
                  w="56px" h="56px" bg="slate.100"
                  display="flex" alignItems="center" justifyContent="center">
                  <Icon as={LucideCreditCard} w={7} h={7} color="slate.400" />
                </Box>
                <Text color="slate.600" fontWeight="semibold">No cards saved yet</Text>
                <Text color="slate.400" fontSize="xs" maxW="280px">
                  Add a card so you can accept leads instantly — no manual payment needed each time.
                </Text>
                <Button
                  mt={2} bg="#0A80DB" color="white" borderRadius="4px" fontWeight="bold"
                  _hover={{ bg: '#0870C2' }}
                  loading={adding} loadingText="Redirecting to Stripe..."
                  onClick={handleAdd}>
                  <Icon as={LucidePlus} w={4} h={4} mr={2} />
                  Add your first card
                </Button>
              </VStack>
            ) : (
              <VStack gap={0} align="stretch">
                <AnimatePresence>
                  {cards.map((card, i) => {
                    const isLast = i === cards.length - 1;
                    return (
                      <motion.div key={card.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}>
                        <Box
                          position="relative"
                          bg={card.isDefault ? '#F0F9FF' : 'white'}
                          px={5}
                          py={4}
                          borderBottom={isLast ? undefined : '1px solid #F1F5F9'}>
                          {/* Left accent strip */}
                          <Box
                            position="absolute" left={0} top={0} bottom={0} w="3px"
                            bg={card.isDefault ? '#0A80DB' : '#E3E8EE'} />

                          <Flex justify="space-between" align="center" gap={3}>
                            <HStack gap={3}>
                              <CardIcon brand={card.brand} />
                              <Box>
                                <HStack gap={2}>
                                  <Text fontWeight="bold" color="slate.800" fontSize="sm">
                                    •••• {card.last4}
                                  </Text>
                                  {card.isDefault && (
                                    <Text
                                      style={{
                                        borderRadius: 2,
                                        background: '#0A80DB',
                                        padding: '2px 6px',
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        color: '#fff',
                                      }}>
                                      Default
                                    </Text>
                                  )}
                                </HStack>
                                <Text fontSize="xs" color="slate.400" mt={0.5}>
                                  {BRAND_LABELS[card.brand] ?? card.brand} · expires {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                                </Text>
                              </Box>
                            </HStack>
                            <HStack gap={2}>
                              {!card.isDefault && (
                                <Button size="xs" variant="outline" borderColor="#E3E8EE"
                                  color="slate.500" borderRadius="4px" fontWeight="semibold"
                                  _hover={{ bg: '#F0F9FF', borderColor: '#0A80DB', color: '#0A80DB' }}
                                  loading={settingId === card.id}
                                  onClick={() => handleSetDefault(card.id)}>
                                  <Icon as={LucideStar} w={3} h={3} mr={1} />
                                  Make default
                                </Button>
                              )}
                              <Button size="xs" variant="ghost" color="red.400" borderRadius="4px"
                                _hover={{ bg: 'red.50', color: 'red.600' }}
                                loading={removingId === card.id}
                                onClick={() => handleRemove(card.id)}>
                                <Icon as={LucideTrash2} w={3.5} h={3.5} />
                              </Button>
                            </HStack>
                          </Flex>
                        </Box>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                <Box px={5} py={3} borderTop="1px solid #F1F5F9" bg="white">
                  <Button
                    variant="outline" borderColor="#E3E8EE" color="slate.500"
                    borderRadius="4px" fontWeight="semibold" fontSize="sm"
                    _hover={{ borderColor: '#0A80DB', color: '#0A80DB', bg: '#F0F9FF' }}
                    loading={adding} loadingText="Redirecting to Stripe..."
                    onClick={handleAdd}>
                    <Icon as={LucidePlus} w={4} h={4} mr={2} />
                    Add another card
                  </Button>
                </Box>
              </VStack>
            )}
          </Box>

          {/* Security note: flat HStack */}
          <HStack gap={2} justify="center" color="slate.400">
            <Icon as={LucideShieldCheck} w={4} h={4} />
            <Text fontSize="xs">Your card is stored securely via Stripe — we never see your full card number</Text>
          </HStack>

        </VStack>
      </Box>
    </Box>
  );
}

export default function PaymentMethodsPage() {
  return (
    <Suspense>
      <PaymentMethodsContent />
    </Suspense>
  );
}
