'use client';

import { useState, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box, Flex, VStack, HStack, Text, Heading, Button, Input, Textarea,
  Container, Icon, SimpleGrid, Badge,
} from '@chakra-ui/react';
import {
  LucideArrowRight, LucideMapPin, LucideCalendar, LucideBanknote,
  LucideClock, LucideUser, LucideLock, LucideMail, LucideCheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NextLink from 'next/link';
import { SERVICE_TYPES, FREQUENCY_OPTIONS, EXTRAS, calculateEstimate } from '@/lib/estimate';
import { toaster } from '@/lib/toaster';

export default function RequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Form
  const [serviceType, setServiceType]     = useState('standard');
  const [address, setAddress]             = useState('');
  const [dateTime, setDateTime]           = useState('');
  const [bedrooms, setBedrooms]           = useState(2);
  const [bathrooms, setBathrooms]         = useState(1);
  const [squareMeters, setSquareMeters]   = useState(0);
  const [extras, setExtras]               = useState<string[]>([]);
  const [frequency, setFrequency]         = useState('once');
  const [notes, setNotes]                 = useState('');

  // Guest register step
  const [showRegister, setShowRegister]   = useState(false);
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [loading, setLoading]             = useState(false);

  const estimate = useMemo(() =>
    calculateEstimate({ serviceType, bedrooms, bathrooms, squareMeters, extras, frequency }),
    [serviceType, bedrooms, bathrooms, squareMeters, extras, frequency],
  );

  const toggleExtra = (id: string) =>
    setExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);

  const submitLead = async () => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType, address, dateTime, bedrooms, bathrooms,
        squareMeters, extras, frequency, notes,
        estimatedMinPrice: estimate.minPrice,
        estimatedMaxPrice: estimate.maxPrice,
        estimatedHours: estimate.hours,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Erro ao criar pedido');
    }
  };

  const handleSubmit = async () => {
    if (!address.trim() || !dateTime) {
      toaster.create({ title: 'Preencha endereço e data', type: 'error' });
      return;
    }
    if (status === 'authenticated') {
      setLoading(true);
      try {
        await submitLead();
        router.push('/dashboard/client');
      } catch (err: any) {
        toaster.create({ title: err.message, type: 'error' });
      } finally { setLoading(false); }
    } else {
      setShowRegister(true);
      setTimeout(() => document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleRegisterAndSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      toaster.create({ title: 'Preencha todos os campos', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'CLIENT' }),
      });
      if (!regRes.ok) {
        const d = await regRes.json();
        throw new Error(d.error || 'Erro ao criar conta');
      }
      const loginRes = await signIn('credentials', { email, password, redirect: false });
      if (!loginRes?.ok) throw new Error('Erro ao fazer login');
      await submitLead();
      router.push('/dashboard/client');
    } catch (err: any) {
      toaster.create({ title: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box minH="100vh" bg="slate.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="slate.100" position="sticky" top={0} zIndex={50}>
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center">
            <NextLink href="/">
              <HStack gap={2} cursor="pointer">
                <Box w="32px" h="32px" bgGradient="to-br" gradientFrom="brand.500" gradientTo="brand.700"
                  borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                  <Text color="white" fontWeight="black" fontSize="xs">BC</Text>
                </Box>
                <Text fontWeight="black" fontSize="md" color="slate.900">
                  Brazilian<Text as="span" color="brand.500">Clean</Text>
                </Text>
              </HStack>
            </NextLink>
            <HStack gap={4}>
              <NextLink href="/auth/login">
                <Text fontSize="sm" fontWeight="semibold" color="slate.500" cursor="pointer"
                  _hover={{ color: 'brand.500' }} transition="color 0.2s">
                  Já tenho conta
                </Text>
              </NextLink>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="6xl" py={10}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <VStack gap={2} textAlign="center" mb={10}>
            <Heading size="2xl" fontWeight="black" color="slate.900">Solicitar limpeza</Heading>
            <Text color="slate.500">Preencha os detalhes e receba profissionais verificados.</Text>
          </VStack>

          <Flex gap={8} align="start" direction={{ base: 'column', lg: 'row' }}>
            {/* Form */}
            <Box flex={1} bg="white" borderRadius="2xl" border="1px solid" borderColor="slate.200" p={8}>
              <VStack gap={7} align="stretch">

                {/* Service type */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                    letterSpacing="wider" mb={3}>Tipo de limpeza</Text>
                  <SimpleGrid columns={2} gap={3}>
                    {SERVICE_TYPES.map(s => (
                      <motion.div key={s.id} whileTap={{ scale: 0.97 }}>
                        <Box onClick={() => setServiceType(s.id)} cursor="pointer"
                          bg={serviceType === s.id ? 'brand.50' : 'slate.50'}
                          border="2px solid"
                          borderColor={serviceType === s.id ? 'brand.400' : 'slate.200'}
                          borderRadius="xl" p={3} transition="all 0.2s">
                          <HStack gap={2}>
                            <Text fontSize="xl">{s.icon}</Text>
                            <Box>
                              <Text fontSize="sm" fontWeight="bold"
                                color={serviceType === s.id ? 'brand.700' : 'slate.700'}>{s.label}</Text>
                              <Text fontSize="xs" color="slate.400">{s.desc}</Text>
                            </Box>
                          </HStack>
                        </Box>
                      </motion.div>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Address */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                    letterSpacing="wider" mb={2}>Endereço</Text>
                  <HStack>
                    <Icon as={LucideMapPin} color="red.400" w={4} h={4} />
                    <Input value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                  </HStack>
                </Box>

                {/* Date */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                    letterSpacing="wider" mb={2}>Data e hora</Text>
                  <HStack>
                    <Icon as={LucideCalendar} color="brand.400" w={4} h={4} />
                    <Input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                  </HStack>
                </Box>

                {/* Rooms */}
                <SimpleGrid columns={2} gap={4}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Quartos</Text>
                    <HStack>
                      <Button size="sm" variant="outline" borderRadius="lg"
                        onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}>−</Button>
                      <Text fontWeight="bold" minW="8" textAlign="center">{bedrooms}</Text>
                      <Button size="sm" variant="outline" borderRadius="lg"
                        onClick={() => setBedrooms(bedrooms + 1)}>+</Button>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                      letterSpacing="wider" mb={2}>Banheiros</Text>
                    <HStack>
                      <Button size="sm" variant="outline" borderRadius="lg"
                        onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}>−</Button>
                      <Text fontWeight="bold" minW="8" textAlign="center">{bathrooms}</Text>
                      <Button size="sm" variant="outline" borderRadius="lg"
                        onClick={() => setBathrooms(bathrooms + 1)}>+</Button>
                    </HStack>
                  </Box>
                </SimpleGrid>

                {/* Frequency */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                    letterSpacing="wider" mb={2}>Frequência</Text>
                  <HStack gap={2}>
                    {FREQUENCY_OPTIONS.map(f => (
                      <Button key={f.id} size="sm" onClick={() => setFrequency(f.id)}
                        bg={frequency === f.id ? 'brand.500' : 'slate.100'}
                        color={frequency === f.id ? 'white' : 'slate.600'}
                        borderRadius="full" fontWeight="bold"
                        _hover={{ bg: frequency === f.id ? 'brand.600' : 'slate.200' }}>
                        {f.label} {f.tag && <Badge ml={1} colorScheme="green" fontSize="9px">{f.tag}</Badge>}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                {/* Extras */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                    letterSpacing="wider" mb={2}>Extras (opcional)</Text>
                  <SimpleGrid columns={2} gap={2}>
                    {EXTRAS.map(ex => (
                      <Box key={ex.id} onClick={() => toggleExtra(ex.id)} cursor="pointer"
                        bg={extras.includes(ex.id) ? 'yellow.50' : 'slate.50'}
                        border="1px solid"
                        borderColor={extras.includes(ex.id) ? 'yellow.300' : 'slate.200'}
                        borderRadius="xl" px={3} py={2} transition="all 0.2s">
                        <HStack gap={2}>
                          <Text>{ex.icon}</Text>
                          <Box>
                            <Text fontSize="xs" fontWeight="bold"
                              color={extras.includes(ex.id) ? 'yellow.800' : 'slate.600'}>{ex.label}</Text>
                            <Text fontSize="xs" color="slate.400">+R${ex.price}</Text>
                          </Box>
                          {extras.includes(ex.id) && (
                            <Icon as={LucideCheckCircle} w={3.5} h={3.5} color="yellow.600" ml="auto" />
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>

                {/* Notes */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                    letterSpacing="wider" mb={2}>Observações (opcional)</Text>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Ex: Tenho pets, acesso pelo portão lateral…"
                    bg="slate.50" border="1px solid" borderColor="slate.200" borderRadius="xl" rows={3}
                    _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                </Box>

                {/* Submit button */}
                {!showRegister && (
                  <Button onClick={handleSubmit}
                    bg="brand.500" color="white" h="12" borderRadius="xl"
                    fontWeight="bold" loading={loading}
                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                    transition="all 0.2s">
                    Solicitar agora
                    <Icon as={LucideArrowRight} ml={2} />
                  </Button>
                )}
              </VStack>
            </Box>

            {/* Estimate sidebar */}
            <Box w={{ base: 'full', lg: '300px' }} position={{ lg: 'sticky' }} top="90px">
              <Box bg="white" borderRadius="2xl" border="1px solid" borderColor="slate.200" p={6}>
                <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                  letterSpacing="wider" mb={4}>Estimativa de preço</Text>
                <VStack gap={4} align="stretch">
                  <Box bg="green.50" border="1px solid" borderColor="green.100" borderRadius="xl" p={4}>
                    <HStack gap={2} mb={1}>
                      <Icon as={LucideBanknote} w={4} h={4} color="green.600" />
                      <Text fontSize="xs" color="green.600" fontWeight="bold">Faixa estimada</Text>
                    </HStack>
                    <Text fontSize="2xl" fontWeight="black" color="green.700">
                      R$ {estimate.minPrice}–{estimate.maxPrice}
                    </Text>
                    {estimate.discountPct > 0 && (
                      <Badge bg="green.100" color="green.700" borderRadius="full" mt={1}>
                        {estimate.discountPct}% desconto frequência
                      </Badge>
                    )}
                  </Box>
                  <HStack gap={2} px={1}>
                    <Icon as={LucideClock} w={4} h={4} color="brand.400" />
                    <Text fontSize="sm" color="slate.600">
                      Duração estimada: <Text as="span" fontWeight="bold">~{estimate.hours}h</Text>
                    </Text>
                  </HStack>
                  <Box bg="slate.50" borderRadius="xl" p={3}>
                    <Text fontSize="xs" color="slate.500">
                      O preço final é combinado diretamente com o profissional. A estimativa é baseada nas informações fornecidas.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </Box>
          </Flex>

          {/* Register section — only shown when unauthenticated and submit clicked */}
          <AnimatePresence>
            {showRegister && (
              <motion.div
                id="register-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}>
                <Box mt={6} bg="white" borderRadius="2xl" border="2px solid" borderColor="brand.200" p={8}
                  boxShadow="0 4px 24px rgba(37,99,235,0.08)">
                  <VStack gap={6} align="stretch">
                    <VStack gap={1} align="start">
                      <Heading size="md" fontWeight="black" color="slate.900">
                        Criar conta para confirmar
                      </Heading>
                      <Text color="slate.500" fontSize="sm">
                        É grátis e leva menos de 30 segundos. Sem verificação de email.
                      </Text>
                    </VStack>

                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                          letterSpacing="wider" mb={2}>Nome</Text>
                        <HStack>
                          <Icon as={LucideUser} w={4} h={4} color="slate.400" />
                          <Input value={name} onChange={e => setName(e.target.value)}
                            placeholder="Seu nome"
                            bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                            _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                          letterSpacing="wider" mb={2}>Email</Text>
                        <HStack>
                          <Icon as={LucideMail} w={4} h={4} color="slate.400" />
                          <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                            _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontSize="xs" fontWeight="bold" color="slate.500" textTransform="uppercase"
                          letterSpacing="wider" mb={2}>Senha</Text>
                        <HStack>
                          <Icon as={LucideLock} w={4} h={4} color="slate.400" />
                          <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            bg="slate.50" border="1px solid" borderColor="slate.200" h="11" borderRadius="xl"
                            _focus={{ bg: 'white', borderColor: 'brand.300' }} />
                        </HStack>
                      </Box>
                    </SimpleGrid>

                    <Button onClick={handleRegisterAndSubmit}
                      bg="brand.500" color="white" h="12" borderRadius="xl"
                      fontWeight="bold" loading={loading} loadingText="Criando conta e enviando pedido…"
                      _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                      transition="all 0.2s">
                      <Icon as={LucideCheckCircle} mr={2} />
                      Criar conta e confirmar pedido
                    </Button>

                    <Text fontSize="xs" textAlign="center" color="slate.400">
                      Já tem conta?{' '}
                      <NextLink href="/auth/login">
                        <Text as="span" color="brand.500" fontWeight="bold" cursor="pointer">Entrar</Text>
                      </NextLink>
                    </Text>
                  </VStack>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Box>
  );
}
