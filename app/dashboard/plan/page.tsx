'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Button, Icon, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideZap, LucideCheckCircle, LucideCrown, LucideStar,
  LucideShield, LucideTrendingUp, LucideSettings,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { PLANS } from '@/lib/plans';

type PlanId = 'FREE' | 'BASIC' | 'PRO';

const PLAN_ICONS: Record<PlanId, any> = {
  FREE:  LucideShield,
  BASIC: LucideStar,
  PRO:   LucideCrown,
};

const PLAN_COLORS: Record<PlanId, { bg: string; border: string; text: string; btn: string; btnHover: string }> = {
  FREE:  { bg: 'slate.50',  border: 'slate.200', text: 'slate.600', btn: 'slate.600', btnHover: 'slate.700' },
  BASIC: { bg: 'brand.50',  border: 'brand.300', text: 'brand.700', btn: 'brand.500', btnHover: 'brand.600' },
  PRO:   { bg: '#FFFBEB',   border: '#FDE68A',   text: '#92400E',   btn: '#D97706',   btnHover: '#B45309'   },
};

export default function PlanPage() {
  const [currentPlan, setCurrentPlan]     = useState<PlanId>('FREE');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [redirecting, setRedirecting]     = useState(false);
  const [saving, setSaving]               = useState(false);
  const [loading, setLoading]             = useState(true);
  const [livePrices, setLivePrices]       = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, priceRes] = await Promise.all([
        fetch('/api/plan'),
        fetch('/api/plan/prices'),
      ]);
      if (planRes.ok) {
        const data = await planRes.json();
        setCurrentPlan(data.plan as PlanId);
        setHasSubscription(!!data.stripeSubscriptionId);
      }
      if (priceRes.ok) {
        const prices: { id: string; price: number }[] = await priceRes.json();
        const map: Record<string, number> = {};
        prices.forEach(p => { map[p.id] = p.price; });
        setLivePrices(map);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    // Check if returning from successful payment
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('upgraded')) {
      toaster.create({ title: 'Plan activated!', description: 'Your ranking has been updated. You\'ll start getting better leads right away.', type: 'success' });
      window.history.replaceState({}, '', '/dashboard/plan');
    }
  }, [load]);

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === currentPlan) return;

    // FREE downgrade — direct API call (no payment needed)
    if (planId === 'FREE') {
      setSaving(true);
      try {
        await fetch('/api/plan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'FREE' }),
        });
        setCurrentPlan('FREE');
        toaster.create({ title: 'Switched to Free plan.', description: 'No commitment required — upgrade again anytime.', type: 'success' });
      } catch { toaster.create({ title: 'Something went wrong. Please try again.', type: 'error' }); }
      finally { setSaving(false); }
      return;
    }

    // Paid plan → Stripe Checkout
    setRedirecting(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? 'Error creating checkout');
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
      setRedirecting(false);
    }
  };

  const handleManageSubscription = async () => {
    setRedirecting(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? 'Error opening portal');
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
      setRedirecting(false);
    }
  };


  return (
    <Box minH="100vh" bg="white">
      <CleanerNav />
      <Box p={6} maxW="960px" mx="auto">
        <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading" mb={6}>
          Plan &amp; Visibility
        </Heading>

        <VStack gap={8} align="stretch">

          {/* CFS explainer — flat section panel */}
          <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <HStack gap={3}>
                <Icon as={LucideTrendingUp} w={4} h={4} color="brand.500" />
                <Box>
                  <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                    How you rank for new leads
                  </Text>
                  <Text fontSize="xs" color="slate.500">Your score determines how early you see each lead</Text>
                </Box>
              </HStack>
            </Box>
            <Box p={5}>
              <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3}>
                {[
                  { label: 'Plan', max: '30 pts', icon: '💎', desc: 'Pro ranks highest' },
                  { label: 'Service', max: '40 pts', icon: '🧹', desc: 'Services matched' },
                  { label: 'Rating', max: '20 pts', icon: '⭐', desc: 'Client reviews' },
                  { label: 'Area', max: '10 pts', icon: '📍', desc: 'Near client zip code' },
                ].map(item => (
                  <Box key={item.label} border="1px solid #E3E8EE" p={3} textAlign="center">
                    <Text fontSize="lg" mb={1}>{item.icon}</Text>
                    <Text fontSize="xs" fontWeight="bold" color="slate.700">{item.label}</Text>
                    <Text fontSize="xs" color="brand.600" fontWeight="black">{item.max}</Text>
                    <Text fontSize="10px" color="slate.400">{item.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </Box>



          {/* Plan Cards */}
          <Box>
            <Text fontWeight="black" color="slate.900" fontSize="lg" mb={1} fontFamily="heading">
              Choose your plan
            </Text>
            <Text color="slate.500" fontSize="sm" mb={5}>
              A higher plan boosts your score — so you see leads sooner and win more jobs. Start earning today.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              {PLANS.map((plan) => {
                const pid = plan.id as PlanId;
                const c = PLAN_COLORS[pid];
                const isActive = currentPlan === pid;
                const PlanIcon = PLAN_ICONS[pid];
                const accentColor = pid === 'FREE' ? '#64748B' : pid === 'PRO' ? '#D97706' : '#0A80DB';

                return (
                  <Box
                    key={plan.id}
                    bg={isActive ? c.bg : 'white'}
                    border="1px solid"
                    borderColor={isActive ? c.border : '#E3E8EE'}
                    p={5}
                    h="full"
                    display="flex" flexDirection="column"
                    position="relative"
                    overflow="hidden"
                    style={{ borderRadius: 8 }}
                    transition="background 0.15s">

                    {/* Active left accent strip */}
                    {isActive && (
                      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accentColor} />
                    )}

                    {/* Plan badge */}
                    {plan.badge && (
                      <Box position="absolute" top={3} right={3}>
                        <Text
                          style={{
                            borderRadius: 2,
                            background: isActive ? accentColor : '#F1F5F9',
                            padding: '2px 6px',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            color: isActive ? 'white' : '#64748B',
                          }}>
                          {plan.badge}
                        </Text>
                      </Box>
                    )}

                    <VStack align="start" gap={3} flex={1}>
                      <Box w="40px" h="40px" bg={isActive ? accentColor : '#F1F5F9'}
                        display="flex" alignItems="center" justifyContent="center">
                        <Icon as={PlanIcon} w={5} h={5} color={isActive ? 'white' : 'slate.400'} />
                      </Box>

                      <Box>
                        <Text fontWeight="black" color="slate.900" fontSize="lg" fontFamily="heading">{plan.name}</Text>
                        {plan.price === 0 ? (
                          <Text fontSize="sm" color="slate.400">Free</Text>
                        ) : (
                          <HStack gap={1} align="baseline">
                            <Text fontWeight="black" fontSize="xl" color={c.text} fontFamily="heading" letterSpacing="-0.03em">
                              ${livePrices[plan.id] ?? plan.price}
                            </Text>
                            <Text fontSize="xs" color="slate.400">/mo</Text>
                          </HStack>
                        )}
                      </Box>

                      <VStack align="start" gap={1.5} flex={1}>
                        {plan.perks.map(perk => (
                          <HStack key={perk} gap={2} align="start">
                            <Icon as={LucideCheckCircle} w={4} h={4} color={isActive ? accentColor : 'slate.300'} flexShrink={0} mt={0.5} />
                            <Text fontSize="xs" color={isActive ? 'slate.700' : 'slate.500'}>{perk}</Text>
                          </HStack>
                        ))}
                      </VStack>

                      {isActive ? (
                        <Box w="full" py={2} px={4} bg={accentColor} textAlign="center">
                          <HStack gap={1.5} justify="center">
                            <Icon as={LucideZap} w={3.5} h={3.5} color="white" />
                            <Text fontSize="xs" fontWeight="bold" color="white">Current plan</Text>
                          </HStack>
                        </Box>
                      ) : (
                        <Button
                          w="full" size="sm" borderRadius="4px" fontWeight="bold"
                          variant="outline" borderColor={c.border} color={c.text}
                          _hover={{ bg: c.bg }}
                          onClick={() => handleSelectPlan(pid)}
                          loading={redirecting || saving}
                          disabled={redirecting}>
                          {plan.price === 0 ? 'Switch to Free' : `Upgrade to ${plan.name}`}
                        </Button>
                      )}
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Wave info — flat section panel */}
          <Box border="1px solid #E3E8EE" style={{ borderRadius: 8 }} overflow="hidden">
            <Box bg="#F6F9FC" px={5} py={3} borderBottom="1px solid #E3E8EE">
              <Text fontSize="10.5px" fontWeight={700} color="#697386" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                How leads reach you
              </Text>
            </Box>
            <VStack gap={0} align="stretch">
              {[
                {
                  wave: 'Instant Book',
                  time: 'Immediately',
                  cleaners: '1 cleaner',
                  desc: 'Score 85+ — the system books you directly. No competition, no waiting.',
                  chipBg: '#FEFCE8',
                  chipColor: '#854D0E',
                },
                {
                  wave: 'Wave 2',
                  time: 'First 90 seconds',
                  cleaners: '2 cleaners',
                  desc: 'The top 2 ranked cleaners compete. The first to accept wins — the other pays nothing.',
                  chipBg: '#F5F3FF',
                  chipColor: '#0A80DB',
                },
              ].map((w, i, arr) => (
                <HStack
                  key={w.wave}
                  gap={4}
                  border="1px solid #E3E8EE"
                  borderTop={i > 0 ? 'none' : undefined}
                  borderLeft="none"
                  borderRight="none"
                  p={4}
                  align="start">
                  <Box flexShrink={0}>
                    <Text
                      style={{
                        borderRadius: 2,
                        background: w.chipBg,
                        padding: '2px 6px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: w.chipColor,
                      }}>
                      {w.wave}
                    </Text>
                  </Box>
                  <VStack align="start" gap={0.5}>
                    <HStack gap={3}>
                      <Text fontSize="xs" color="slate.500">⏱ {w.time}</Text>
                      <Text fontSize="xs" color="slate.500">👥 {w.cleaners}</Text>
                    </HStack>
                    <Text fontSize="sm" color="slate.600">{w.desc}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Manage subscription — flat panel */}
          {hasSubscription && (
            <Box bg="white" border="1px solid #E3E8EE" p={5} style={{ borderRadius: 8 }}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold" color="slate.800">Billing & subscription</Text>
                  <Text fontSize="sm" color="slate.500" mt={0.5}>
                    Update your payment method, view past invoices, or cancel anytime. No commitment required.
                  </Text>
                </Box>
                <Button
                  size="sm" variant="outline" borderColor="slate.300" color="slate.600"
                  borderRadius="4px" fontWeight="semibold"
                  _hover={{ bg: 'slate.50' }}
                  onClick={handleManageSubscription}
                  loading={redirecting}>
                  <Icon as={LucideSettings} w={4} h={4} mr={1.5} />
                  Manage billing
                </Button>
              </Flex>
            </Box>
          )}

        </VStack>
      </Box>
    </Box>
  );
}
