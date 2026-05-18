'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Button, Icon, Input, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideZap, LucideCheckCircle, LucideCrown, LucideStar, LucideMapPin,
  LucideShield, LucideTrendingUp, LucideSave, LucideSettings,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { PLANS } from '@/lib/pricing';

type PlanId = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';

const PLAN_ICONS: Record<PlanId, any> = {
  FREE:    LucideShield,
  BASIC:   LucideStar,
  PREMIUM: LucideTrendingUp,
  PRO:     LucideCrown,
};

const PLAN_COLORS: Record<PlanId, { bg: string; border: string; text: string; btn: string; btnHover: string }> = {
  FREE:    { bg: 'slate.50',   border: 'slate.200',  text: 'slate.600',  btn: 'slate.600',  btnHover: 'slate.700' },
  BASIC:   { bg: 'brand.50',   border: 'brand.300',  text: 'brand.700',  btn: 'brand.500',  btnHover: 'brand.600' },
  PREMIUM: { bg: '#F5F3FF',    border: '#C4B5FD',    text: '#7C3AED',    btn: '#7C3AED',    btnHover: '#6D28D9' },
  PRO:     { bg: 'yellow.50',  border: 'yellow.400', text: 'yellow.700', btn: '#D97706',    btnHover: '#B45309' },
};

export default function PlanPage() {
  const [currentPlan, setCurrentPlan]     = useState<PlanId>('FREE');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [zipCode, setZipCode]             = useState('');
  const [saving, setSaving]               = useState(false);
  const [redirecting, setRedirecting]     = useState(false);
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
        setZipCode(data.zipCode ?? '');
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
      toaster.create({ title: 'Assinatura ativada! 🎉', description: 'Seu ranking CFS foi atualizado.', type: 'success' });
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
        toaster.create({ title: 'Plano rebaixado para Free', type: 'success' });
      } catch { toaster.create({ title: 'Erro ao alterar plano', type: 'error' }); }
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
        throw new Error(data.error ?? 'Erro ao criar checkout');
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
        throw new Error(data.error ?? 'Erro ao abrir portal');
      }
    } catch (e: any) {
      toaster.create({ title: e.message, type: 'error' });
      setRedirecting(false);
    }
  };

  const handleSaveZip = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode }),
      });
      if (res.ok) {
        toaster.create({ title: 'CEP salvo!', description: 'Leads da sua região serão priorizados.', type: 'success' });
      }
    } catch { toaster.create({ title: 'Erro ao salvar CEP', type: 'error' }); }
    finally { setSaving(false); }
  };

  return (
    <Box minH="100vh" bg="#F8FAFC">
      <CleanerNav />
      <Box p={6} maxW="960px" mx="auto">
        <Heading size="md" fontWeight="bold" color="slate.900" fontFamily="heading" mb={6}>
          Meu Plano
        </Heading>

        <VStack gap={8} align="stretch">

          {/* CFS explainer — flat section panel */}
          <Box border="1px solid #E2E8F0">
            <Box bg="#F8FAFC" px={5} py={3} borderBottom="1px solid #E2E8F0">
              <HStack gap={3}>
                <Icon as={LucideTrendingUp} w={4} h={4} color="brand.500" />
                <Box>
                  <Text fontSize="10.5px" fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                    Como funciona o Ranking CFS
                  </Text>
                  <Text fontSize="xs" color="slate.500">Cleaner Fit Score — determina quem recebe os leads primeiro</Text>
                </Box>
              </HStack>
            </Box>
            <Box p={5}>
              <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3}>
                {[
                  { label: 'Plano', max: '30 pts', icon: '💎', desc: 'PRO = topo' },
                  { label: 'Serviço', max: '40 pts', icon: '🧹', desc: 'Match exato' },
                  { label: 'Rating', max: '20 pts', icon: '⭐', desc: 'Avaliação média' },
                  { label: 'Região', max: '10 pts', icon: '📍', desc: 'Mesmo CEP' },
                ].map(item => (
                  <Box key={item.label} border="1px solid #E2E8F0" p={3} textAlign="center">
                    <Text fontSize="lg" mb={1}>{item.icon}</Text>
                    <Text fontSize="xs" fontWeight="bold" color="slate.700">{item.label}</Text>
                    <Text fontSize="xs" color="brand.600" fontWeight="black">{item.max}</Text>
                    <Text fontSize="10px" color="slate.400">{item.desc}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </Box>

          {/* ZIP Code — flat panel */}
          <Box border="1px solid #E2E8F0">
            <Box bg="#F8FAFC" px={5} py={3} borderBottom="1px solid #E2E8F0">
              <HStack gap={2}>
                <Icon as={LucideMapPin} w={4} h={4} color="red.500" />
                <Text fontSize="10.5px" fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                  Minha Região (CEP)
                </Text>
                <Text
                  style={{
                    borderRadius: 2,
                    background: '#F0FDF4',
                    padding: '2px 6px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                    color: '#15803D',
                  }}>
                  +10 pts no ranking
                </Text>
              </HStack>
            </Box>
            <Box p={5}>
              <HStack gap={3}>
                <Input
                  placeholder="Ex: 01310-100"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  maxLength={9}
                  bg="white" border="1px solid" borderColor="slate.200"
                  h="11" borderRadius="4px" flex={1}
                  _focus={{ bg: 'white', borderColor: 'brand.300' }}
                />
                <Button bg="brand.500" color="white" borderRadius="4px" fontWeight="bold" px={5} h="11"
                  _hover={{ bg: 'brand.600' }} onClick={handleSaveZip} loading={saving}>
                  <Icon as={LucideSave} w={4} h={4} mr={2} />
                  Salvar
                </Button>
              </HStack>
              <Text fontSize="xs" color="slate.400" mt={2}>
                Leads na mesma região ganham +10 pontos no seu CFS, aumentando suas chances de ser chamado primeiro.
              </Text>
            </Box>
          </Box>

          {/* Plan Cards */}
          <Box>
            <Text fontWeight="black" color="slate.900" fontSize="lg" mb={1} fontFamily="heading">
              Escolha seu plano
            </Text>
            <Text color="slate.500" fontSize="sm" mb={5}>
              Planos maiores = mais pontos no CFS = você aparece primeiro para os clientes.
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              {PLANS.map((plan) => {
                const pid = plan.id as PlanId;
                const c = PLAN_COLORS[pid];
                const isActive = currentPlan === pid;
                const PlanIcon = PLAN_ICONS[pid];
                const accentColor = pid === 'FREE' ? '#64748B' : pid === 'BASIC' ? '#1A7FA0' : pid === 'PREMIUM' ? '#7C3AED' : '#D97706';

                return (
                  <Box
                    key={plan.id}
                    bg={isActive ? c.bg : 'white'}
                    border="1px solid"
                    borderColor={isActive ? c.border : 'slate.200'}
                    p={5}
                    h="full"
                    display="flex" flexDirection="column"
                    position="relative"
                    overflow="hidden"
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
                          <Text fontSize="sm" color="slate.400">Gratuito</Text>
                        ) : (
                          <HStack gap={1} align="baseline">
                            <Text fontWeight="black" fontSize="xl" color={c.text} fontFamily="heading" letterSpacing="-0.03em">
                              R$ {livePrices[plan.id] ?? plan.price}
                            </Text>
                            <Text fontSize="xs" color="slate.400">/mês</Text>
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
                            <Text fontSize="xs" fontWeight="bold" color="white">Plano atual</Text>
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
                          {plan.price === 0 ? 'Usar grátis' : `Assinar ${plan.name}`}
                        </Button>
                      )}
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Box>

          {/* Wave info — flat section panel */}
          <Box border="1px solid #E2E8F0">
            <Box bg="#F8FAFC" px={5} py={3} borderBottom="1px solid #E2E8F0">
              <Text fontSize="10.5px" fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing="0.06em" fontFamily="heading">
                Como os leads são distribuídos
              </Text>
            </Box>
            <VStack gap={0} align="stretch">
              {[
                {
                  wave: 'Instant Book',
                  time: 'Imediato',
                  cleaners: '1 profissional',
                  desc: 'Score ≥ 85 pts — o sistema faz o match direto. Sem concorrência.',
                  chipBg: '#FEFCE8',
                  chipColor: '#854D0E',
                },
                {
                  wave: 'Wave 1',
                  time: '90 segundos',
                  cleaners: '1 exclusivo',
                  desc: 'Top 1 do ranking. Janela exclusiva — nenhum outro vê o lead.',
                  chipBg: '#EFF6FF',
                  chipColor: '#1A7FA0',
                },
                {
                  wave: 'Wave 2',
                  time: '180 segundos',
                  cleaners: '2 simultâneos',
                  desc: 'Se Wave 1 expirar: 2 profissionais concorrem. Primeiro a aceitar vence. O perdedor não paga.',
                  chipBg: '#F5F3FF',
                  chipColor: '#7C3AED',
                },
              ].map((w, i, arr) => (
                <HStack
                  key={w.wave}
                  gap={4}
                  border="1px solid #E2E8F0"
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
            <Box bg="white" border="1px solid #E2E8F0" p={5}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold" color="slate.800">Gerenciar assinatura</Text>
                  <Text fontSize="sm" color="slate.500" mt={0.5}>
                    Atualize seu cartão, veja faturas ou cancele pelo portal do Stripe.
                  </Text>
                </Box>
                <Button
                  size="sm" variant="outline" borderColor="slate.300" color="slate.600"
                  borderRadius="4px" fontWeight="semibold"
                  _hover={{ bg: 'slate.50' }}
                  onClick={handleManageSubscription}
                  loading={redirecting}>
                  <Icon as={LucideSettings} w={4} h={4} mr={1.5} />
                  Gerenciar
                </Button>
              </Flex>
            </Box>
          )}

        </VStack>
      </Box>
    </Box>
  );
}
