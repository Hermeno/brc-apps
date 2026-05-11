'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Flex, VStack, HStack, Text, Heading, Badge, Button, Icon, Input, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideZap, LucideCheckCircle, LucideCrown, LucideStar, LucideMapPin,
  LucideShield, LucideTrendingUp, LucideSave, LucideSettings,
} from 'lucide-react';
import CleanerNav from '@/components/cleaner-nav';
import { toaster } from '@/lib/toaster';
import { motion, AnimatePresence } from 'motion/react';
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plan');
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(data.plan as PlanId);
        setZipCode(data.zipCode ?? '');
        setHasSubscription(!!data.stripeSubscriptionId);
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
    <Box minH="100vh" bg="slate.50">
      <CleanerNav />
      <Box p={6} maxW="960px" mx="auto">
        <HStack gap={2.5} mb={6}>
          <Box w="8px" h="8px" bg="yellow.400" borderRadius="full" boxShadow="0 0 0 3px rgba(251,191,36,0.2)" />
          <Heading size="md" fontWeight="bold" color="slate.900">Meu Plano</Heading>
        </HStack>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <VStack gap={8} align="stretch">

              {/* CFS explainer */}
              <Box bg="white" border="1px solid" borderColor="brand.100" borderRadius="2xl" p={6}>
                <HStack gap={3} mb={3}>
                  <Box w="36px" h="36px" bg="brand.50" borderRadius="xl"
                    display="flex" alignItems="center" justifyContent="center">
                    <Icon as={LucideTrendingUp} w={5} h={5} color="brand.500" />
                  </Box>
                  <Box>
                    <Text fontWeight="black" color="slate.900">Como funciona o Ranking CFS</Text>
                    <Text fontSize="xs" color="slate.500">Cleaner Fit Score — determina quem recebe os leads primeiro</Text>
                  </Box>
                </HStack>
                <SimpleGrid columns={{ base: 2, sm: 4 }} gap={3}>
                  {[
                    { label: 'Plano', max: '30 pts', icon: '💎', desc: 'PRO = topo' },
                    { label: 'Serviço', max: '40 pts', icon: '🧹', desc: 'Match exato' },
                    { label: 'Rating', max: '20 pts', icon: '⭐', desc: 'Avaliação média' },
                    { label: 'Região', max: '10 pts', icon: '📍', desc: 'Mesmo CEP' },
                  ].map(item => (
                    <Box key={item.label} bg="slate.50" borderRadius="xl" p={3} textAlign="center">
                      <Text fontSize="lg" mb={1}>{item.icon}</Text>
                      <Text fontSize="xs" fontWeight="bold" color="slate.700">{item.label}</Text>
                      <Text fontSize="xs" color="brand.600" fontWeight="black">{item.max}</Text>
                      <Text fontSize="10px" color="slate.400">{item.desc}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* ZIP Code */}
              <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl" p={6}>
                <HStack gap={2} mb={4}>
                  <Icon as={LucideMapPin} w={5} h={5} color="red.500" />
                  <Text fontWeight="bold" color="slate.800">Minha Região (CEP)</Text>
                  <Badge bg="green.50" color="green.700" borderRadius="full" px={2} fontSize="xs" border="1px solid" borderColor="green.200">
                    +10 pts no ranking
                  </Badge>
                </HStack>
                <HStack gap={3}>
                  <Input
                    placeholder="Ex: 01310-100"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    maxLength={9}
                    bg="slate.50" border="1px solid" borderColor="slate.200"
                    h="11" borderRadius="xl" flex={1}
                    _focus={{ bg: 'white', borderColor: 'brand.300' }}
                  />
                  <Button bg="brand.500" color="white" borderRadius="xl" fontWeight="bold" px={5} h="11"
                    _hover={{ bg: 'brand.600' }} onClick={handleSaveZip} loading={saving}>
                    <Icon as={LucideSave} w={4} h={4} mr={2} />
                    Salvar
                  </Button>
                </HStack>
                <Text fontSize="xs" color="slate.400" mt={2}>
                  Leads na mesma região ganham +10 pontos no seu CFS, aumentando suas chances de ser chamado primeiro.
                </Text>
              </Box>

              {/* Plan Cards */}
              <Box>
                <Text fontWeight="black" color="slate.900" fontSize="lg" mb={1}>Escolha seu plano</Text>
                <Text color="slate.500" fontSize="sm" mb={5}>
                  Planos maiores = mais pontos no CFS = você aparece primeiro para os clientes.
                </Text>

                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                  {PLANS.map((plan, i) => {
                    const pid = plan.id as PlanId;
                    const c = PLAN_COLORS[pid];
                    const isActive = currentPlan === pid;
                    const PlanIcon = PLAN_ICONS[pid];

                    return (
                      <motion.div key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.07 }}
                        whileHover={{ y: -4 }}>
                        <Box
                          bg={isActive ? c.bg : 'white'}
                          border="2px solid"
                          borderColor={isActive ? c.border : 'slate.200'}
                          borderRadius="2xl"
                          p={5}
                          h="full"
                          display="flex" flexDirection="column"
                          boxShadow={isActive ? `0 4px 20px rgba(0,0,0,0.08)` : 'none'}
                          transition="all 0.2s"
                          position="relative"
                          overflow="hidden">

                          {/* Active ribbon */}
                          {isActive && (
                            <Box position="absolute" top={0} right={0} left={0} h="3px" bg={c.btn} />
                          )}

                          {/* Badge */}
                          {plan.badge && (
                            <Badge position="absolute" top={3} right={3}
                              bg={isActive ? c.btn : 'slate.100'}
                              color={isActive ? 'white' : 'slate.500'}
                              borderRadius="full" px={2} fontSize="10px" fontWeight="bold">
                              {plan.badge}
                            </Badge>
                          )}

                          <VStack align="start" gap={3} flex={1}>
                            <Box w="40px" h="40px" bg={isActive ? c.btn : 'slate.100'} borderRadius="xl"
                              display="flex" alignItems="center" justifyContent="center">
                              <Icon as={PlanIcon} w={5} h={5} color={isActive ? 'white' : 'slate.400'} />
                            </Box>

                            <Box>
                              <Text fontWeight="black" color="slate.900" fontSize="lg">{plan.name}</Text>
                              {plan.price === 0 ? (
                                <Text fontSize="sm" color="slate.400">Gratuito</Text>
                              ) : (
                                <HStack gap={1} align="baseline">
                                  <Text fontWeight="black" fontSize="xl" color={c.text}>
                                    R$ {plan.price}
                                  </Text>
                                  <Text fontSize="xs" color="slate.400">/mês</Text>
                                </HStack>
                              )}
                            </Box>

                            <VStack align="start" gap={1.5} flex={1}>
                              {plan.perks.map(perk => (
                                <HStack key={perk} gap={2} align="start">
                                  <Icon as={LucideCheckCircle} w={4} h={4} color={isActive ? c.btn : 'slate.300'} flexShrink={0} mt={0.5} />
                                  <Text fontSize="xs" color={isActive ? 'slate.700' : 'slate.500'}>{perk}</Text>
                                </HStack>
                              ))}
                            </VStack>

                            <AnimatePresence mode="wait">
                              {isActive ? (
                                <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
                                  <Box
                                    w="full" py={2} px={4} borderRadius="xl"
                                    bg={c.btn} textAlign="center">
                                    <HStack gap={1.5} justify="center">
                                      <Icon as={LucideZap} w={3.5} h={3.5} color="white" />
                                      <Text fontSize="xs" fontWeight="bold" color="white">Plano atual</Text>
                                    </HStack>
                                  </Box>
                                </motion.div>
                              ) : (
                                <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
                                  <Button
                                    w="full" size="sm" borderRadius="xl" fontWeight="bold"
                                    variant="outline" borderColor={c.border} color={c.text}
                                    _hover={{ bg: c.bg }}
                                    onClick={() => handleSelectPlan(pid)}
                                    loading={redirecting || saving}
                                    disabled={redirecting}>
                                    {plan.price === 0 ? 'Usar grátis' : `Assinar ${plan.name}`}
                                  </Button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </VStack>
                        </Box>
                      </motion.div>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Manage subscription */}
              {hasSubscription && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl" p={5}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold" color="slate.800">Gerenciar assinatura</Text>
                        <Text fontSize="sm" color="slate.500" mt={0.5}>
                          Atualize seu cartão, veja faturas ou cancele pelo portal do Stripe.
                        </Text>
                      </Box>
                      <Button
                        size="sm" variant="outline" borderColor="slate.300" color="slate.600"
                        borderRadius="xl" fontWeight="semibold"
                        _hover={{ bg: 'slate.50' }}
                        onClick={handleManageSubscription}
                        loading={redirecting}>
                        <Icon as={LucideSettings} w={4} h={4} mr={1.5} />
                        Gerenciar
                      </Button>
                    </Flex>
                  </Box>
                </motion.div>
              )}

              {/* Wave info */}
              <Box bg="white" border="1px solid" borderColor="slate.200" borderRadius="2xl" p={6}>
                <Text fontWeight="black" color="slate.900" mb={4}>Como os leads são distribuídos</Text>
                <VStack gap={3} align="stretch">
                  {[
                    {
                      wave: 'Instant Book',
                      time: 'Imediato',
                      cleaners: '1 profissional',
                      desc: 'Score ≥ 85 pts — o sistema faz o match direto. Sem concorrência.',
                      color: 'yellow',
                    },
                    {
                      wave: 'Wave 1',
                      time: '90 segundos',
                      cleaners: '1 exclusivo',
                      desc: 'Top 1 do ranking. Janela exclusiva — nenhum outro vê o lead.',
                      color: 'brand',
                    },
                    {
                      wave: 'Wave 2',
                      time: '180 segundos',
                      cleaners: '2 simultâneos',
                      desc: 'Se Wave 1 expirar: 2 profissionais concorrem. Primeiro a aceitar vence. O perdedor não paga.',
                      color: 'purple',
                    },
                  ].map(w => (
                    <HStack key={w.wave} gap={4} bg="slate.50" borderRadius="xl" p={4} align="start">
                      <Box flexShrink={0}>
                        <Badge
                          bg={`${w.color}.100`} color={`${w.color}.700`}
                          border="1px solid" borderColor={`${w.color}.300`}
                          borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="bold">
                          {w.wave}
                        </Badge>
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

            </VStack>
          </motion.div>
      </Box>
    </Box>
  );
}
