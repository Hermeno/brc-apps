'use client';

import { useState, useMemo, Suspense, type ReactNode } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Textarea,
  Container, Icon, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideArrowRight, LucideBanknote, LucideClock, LucideUser,
  LucideLock, LucideMail, LucideCheckCircle, LucidePhone, LucideCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import NextLink from 'next/link';
import { SERVICE_TYPES, FREQUENCY_OPTIONS, EXTRAS, calculateEstimate } from '@/lib/estimate';
import { toaster } from '@/lib/toaster';
import { AddressInput } from '@/components/address-input';
import Image from 'next/image';

const LABEL_STYLE = {
  fontSize: '12px' as const,
  fontWeight: '700' as const,
  color: '#1E3A5F',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  fontFamily: 'heading',
  marginBottom: '9px',
};

function FormLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} style={{ display: 'block', marginBottom: 9, color: '#1E3A5F', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{children}</label>;
}

function RequestForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  // Direct request (Thumbtack-style): client came from a cleaner's card.
  const targetCleanerId   = params.get('cleaner') || '';
  const targetCleanerName = params.get('name') || '';
  const initialService    = params.get('service') || '';

  // ZIP typed in the home search. Only a well-formed 5-digit value is carried
  // over — anything else is ignored rather than pre-filling a broken address.
  const initialZip = (params.get('zip') || '').trim();
  const seededZip  = /^\d{5}$/.test(initialZip) ? initialZip : '';

  const [serviceType, setServiceType]   = useState(initialService || 'standard');
  const [address, setAddress]           = useState(seededZip);
  // null until the server has answered for the typed address. Only a definitive
  // false blocks submission, so a slow or failed check never traps the client —
  // /api/leads refuses an unplaceable address regardless.
  const [addressOk, setAddressOk]       = useState<boolean | null>(null);
  const [dateVal, setDateVal]           = useState('');
  const [timeVal, setTimeVal]           = useState('');
  const [bedrooms, setBedrooms]         = useState(2);
  const [bathrooms, setBathrooms]       = useState(1);
  const [squareMeters, setSquareMeters] = useState(0);
  const [extras, setExtras]             = useState<string[]>([]);
  const [frequency, setFrequency]       = useState('once');
  const [notes, setNotes]               = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [authMode, setAuthMode]         = useState<'register' | 'login'>('register');
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [regPhone, setRegPhone]         = useState('+1 ');
  const [loading, setLoading]           = useState(false);

  const estimate = useMemo(() =>
    calculateEstimate({ serviceType, bedrooms, bathrooms, squareMeters, extras, frequency }),
    [serviceType, bedrooms, bathrooms, squareMeters, extras, frequency],
  );

  const toggleExtra = (id: string) =>
    setExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);

  const submitLead = async () => {
    const dateTime = dateVal && timeVal ? `${dateVal}T${timeVal}` : '';
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType, address, dateTime, bedrooms, bathrooms,
        squareMeters, extras, frequency, notes,
        estimatedMinPrice: estimate.minPrice,
        estimatedMaxPrice: estimate.maxPrice,
        estimatedHours: estimate.hours,
        ...(targetCleanerId ? { targetCleanerId } : {}),
      }),
    });
    if (!res.ok) {
      let msg = 'Failed to submit request';
      try { const d = await res.json(); msg = d.error || d.message || msg; } catch {}
      throw new Error(msg);
    }
  };

  const handleSubmit = async () => {
    if (!address.trim() || !dateVal || !timeVal) {
      toaster.create({ title: 'Please add your address and preferred date to continue', type: 'error' });
      return;
    }
    if (addressOk === false) {
      toaster.create({
        title: 'We could not locate that address. Check the ZIP code, or add the city and state.',
        type:  'error',
      });
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
      toaster.create({ title: 'Please fill in your name, email, and password', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'CLIENT', phone: regPhone.trim().length > 4 ? regPhone.trim() : undefined }),
      });
      if (!regRes.ok) {
        const d = await regRes.json();
        throw new Error(d.error || 'Failed to create account');
      }
      const loginRes = await signIn('credentials', { email, password, redirect: false });
      if (!loginRes?.ok) throw new Error('Login failed after registration');
      await submitLead();
      router.push('/dashboard/client');
    } catch (err: any) {
      toaster.create({ title: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  const handleLoginAndSubmit = async () => {
    if (!email.trim() || !password) {
      toaster.create({ title: 'Please enter your email and password', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const loginRes = await signIn('credentials', { email, password, redirect: false });
      if (!loginRes?.ok) throw new Error('Incorrect email or password');
      await submitLead();
      router.push('/dashboard/client');
    } catch (err: any) {
      toaster.create({ title: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  const inputStyle = {
    bg: '#FFFFFF',
    border: '1px solid',
    borderColor: '#CBD8E0',
    h: '50px',
    borderRadius: '5px',
    color: '#1E3A5F',
    fontFamily: 'heading',
    fontSize: '14px',
    px: 3.5,
    _placeholder: { color: '#7B8DA0' },
    _hover: { borderColor: '#8DAABD' },
    _focusVisible: { borderColor: '#1E3A5F', boxShadow: '0 0 0 3px rgba(212,175,55,.28)' },
  } as const;

  const estimateSummary = (
    <Box bg="#FFFFFF" border="1px solid #D7E2E8" borderRadius="6px" overflow="hidden">
      <Box bg="#EDF3F5" px={{ base: 5, md: 6 }} py={4} borderBottom="1px solid #D7E2E8">
        <HStack gap={2.5}>
          <Icon as={LucideBanknote} boxSize="18px" color="#1E3A5F" />
          <Text fontSize="12px" fontWeight="800" letterSpacing=".1em" color="#1E3A5F" textTransform="uppercase" fontFamily="heading">
            Your estimate
          </Text>
        </HStack>
      </Box>
      <Box px={{ base: 5, md: 6 }} py={5}>
        <Text fontSize="13px" color="#526A7F" fontFamily="heading" mb={1}>Estimated price range</Text>
        <Text fontFamily="heading" fontSize={{ base: '30px', md: '34px' }} fontWeight="800" lineHeight="1.1" letterSpacing="-.045em" color="#1E3A5F">
          {'$'}{estimate.minPrice}–{'$'}{estimate.maxPrice}
        </Text>
        {estimate.discountPct > 0 && (
          <Text mt={2} fontSize="12px" fontWeight="700" color="#725915" fontFamily="heading">
            {estimate.discountPct}% recurring discount included
          </Text>
        )}
        <Box h="1px" bg="#E2E9ED" my={5} />
        <HStack gap={2.5} color="#365878">
          <Icon as={LucideClock} boxSize="17px" />
          <Text fontSize="13px" fontFamily="heading">About <Text as="span" fontWeight="800" color="#1E3A5F">{estimate.hours} hours</Text> of work</Text>
        </HStack>
        <Text mt={5} fontSize="12px" lineHeight="1.65" color="#526A7F" fontFamily="heading">
          This is a guide, not a final quote. Discuss the work and price with the cleaner before deciding.
        </Text>
      </Box>
    </Box>
  );

  return (
    <Box minH="100vh" bg="#F8F8F4" color="#1E3A5F">
      <Box as="header" bg="#FFFFFF" borderBottom="1px solid #DDE5E9" position="sticky" top={0} zIndex={50}>
        <Flex align="center" justify="space-between" h={{ base: '66px', md: '76px' }} px={{ base: 5, md: 8 }} maxW="1250px" mx="auto">
          <NextLink href="/" aria-label="Verliks home">
            <HStack gap={2} minH="44px">
              <Image src="/images/brand/verliks-logo-600.png" alt="" width={159} height={34} style={{ objectFit: 'contain' }} />
            </HStack>
          </NextLink>
          <NextLink href="/auth/login">
            <Text fontSize={{ base: '13px', md: '14px' }} fontWeight="700" color="#1E3A5F" fontFamily="heading" _hover={{ textDecoration: 'underline' }} textUnderlineOffset="5px">
              Sign in
            </Text>
          </NextLink>
        </Flex>
      </Box>

      <Container maxW="1200px" px={{ base: 5, md: 8 }} pt={{ base: 9, md: 14 }} pb={{ base: 16, md: 24 }}>
        <Flex align={{ base: 'start', lg: 'end' }} justify="space-between" gap={7} direction={{ base: 'column', lg: 'row' }} mb={{ base: 8, md: 10 }}>
          <Box maxW="750px">
            <HStack gap={3} mb={4}>
              <Box w="26px" h="2px" bg="#D4AF37" />
              <Text fontSize="12px" color="#365878" fontWeight="800" letterSpacing=".15em" textTransform="uppercase" fontFamily="heading">
                A cleaner home starts here
              </Text>
            </HStack>
            <Text as="h1" fontFamily="heading" fontSize={{ base: '37px', sm: '45px', md: '58px' }} fontWeight="800" letterSpacing="-.055em" lineHeight="1.06" color="#1E3A5F">
              Tell us what needs cleaning.
            </Text>
            <Text fontSize={{ base: '15px', md: '17px' }} color="#526A7F" lineHeight="1.65" fontFamily="heading" mt={4} maxW="620px">
              {targetCleanerId
                ? 'Share the details below and your request will go directly to this professional.'
                : 'Share a few details about your space. A local independent cleaner can review your request, then you can agree on the work and price together.'}
            </Text>
          </Box>
          <HStack align="center" gap={3} flexShrink={0} color="#1E3A5F" pb={{ lg: 1 }}>
            <Flex w="34px" h="34px" borderRadius="full" bg="#1E3A5F" color="white" align="center" justify="center" fontSize="12px" fontWeight="800">01</Flex>
            <Text fontSize="13px" fontWeight="800" fontFamily="heading">Request details</Text>
            <Box w="32px" h="1px" bg="#C7D6DE" mx={1} />
            <Flex w="34px" h="34px" borderRadius="full" bg={showRegister ? '#1E3A5F' : '#E7EFF2'} color={showRegister ? 'white' : '#607990'} align="center" justify="center" fontSize="12px" fontWeight="800">02</Flex>
            <Text fontSize="13px" fontWeight="700" color={showRegister ? '#1E3A5F' : '#607990'} fontFamily="heading">Send request</Text>
          </HStack>
        </Flex>

        {targetCleanerId && (
          <Flex mb={6} align="center" justify="space-between" gap={4} flexWrap="wrap" bg="#EDF3F5" borderLeft="3px solid #D4AF37" px={5} py={4}>
            <HStack gap={3} align="start">
              <Icon as={LucideUser} boxSize="18px" color="#1E3A5F" mt="2px" />
              <Box>
                <Text fontWeight="800" fontSize="14px" fontFamily="heading">Requesting {targetCleanerName || 'this cleaner'} directly</Text>
                <Text color="#526A7F" fontSize="13px" fontFamily="heading">Only this professional will receive your request.</Text>
              </Box>
            </HStack>
            <NextLink href="/dashboard/cleaners">
              <Text fontSize="13px" fontWeight="800" fontFamily="heading" textDecoration="underline" textUnderlineOffset="4px">Choose someone else</Text>
            </NextLink>
          </Flex>
        )}

        <Flex gap={{ base: 6, lg: 8 }} align="start" direction={{ base: 'column', lg: 'row' }}>
          <Box flex={1} minW={0} w="full" bg="#FFFFFF" border="1px solid #DDE5E9" borderRadius="6px" overflow="hidden">
            <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }} borderBottom="1px solid #E2E9ED">
              <HStack align="start" gap={4} mb={6}>
                <Text fontSize="13px" fontWeight="800" color="#9B7C24" fontFamily="heading" pt={1}>01</Text>
                <Box>
                  <Text as="h2" fontSize={{ base: '21px', md: '24px' }} fontWeight="800" letterSpacing="-.03em" fontFamily="heading" lineHeight="1.2">Choose your service</Text>
                  <Text mt={1} fontSize="13px" color="#60758A" fontFamily="heading">Pick the work that best fits your space.</Text>
                </Box>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={2.5}>
                {SERVICE_TYPES.map(s => {
                  const selected = serviceType === s.id;
                  return (
                    <Button type="button" variant="plain" key={s.id} onClick={() => setServiceType(s.id)}
                      aria-pressed={selected} textAlign="left" minH="73px" px={4} py={3} cursor="pointer"
                      bg={selected ? '#EDF3F5' : '#FFFFFF'} border="1px solid"
                      borderColor={selected ? '#1E3A5F' : '#DDE5E9'} borderRadius="5px"
                      _hover={{ borderColor: '#8DAABD', bg: '#F6F9FA' }}
                      _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '2px' }}
                      transition="background .15s, border-color .15s"
                    >
                      <Flex align="start" justify="space-between" gap={3}>
                        <Box>
                          <Text fontSize="14px" fontWeight="800" color="#1E3A5F" fontFamily="heading" lineHeight="1.3">{s.labelEn}</Text>
                          <Text mt={0.5} fontSize="12px" lineHeight="1.4" color="#60758A" fontFamily="heading">{s.descEn}</Text>
                        </Box>
                        <Flex flexShrink={0} w="19px" h="19px" borderRadius="full" border="1.5px solid" borderColor={selected ? '#1E3A5F' : '#A7BAC6'}
                          bg={selected ? '#1E3A5F' : 'white'} align="center" justify="center" mt={0.5}>
                          {selected && <Icon as={LucideCheck} boxSize="12px" color="white" />}
                        </Flex>
                      </Flex>
                    </Button>
                  );
                })}
              </SimpleGrid>
            </Box>

            <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }} borderBottom="1px solid #E2E9ED">
              <HStack align="start" gap={4} mb={6}>
                <Text fontSize="13px" fontWeight="800" color="#9B7C24" fontFamily="heading" pt={1}>02</Text>
                <Box>
                  <Text as="h2" fontSize={{ base: '21px', md: '24px' }} fontWeight="800" letterSpacing="-.03em" fontFamily="heading" lineHeight="1.2">Where and when?</Text>
                  <Text mt={1} fontSize="13px" color="#60758A" fontFamily="heading">Add the location and a time that works for you.</Text>
                </Box>
              </HStack>
              <VStack gap={5} align="stretch">
                <Box>
                  <FormLabel htmlFor="request-address">Cleaning address or ZIP code</FormLabel>
                  <AddressInput value={address} onChange={setAddress} onResolve={setAddressOk}
                    placeholder="123 Main St, Hartford, CT 06103"
                    inputProps={{ ...inputStyle, id: 'request-address', autoComplete: 'street-address' }} />
                </Box>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  <Box>
                    <FormLabel htmlFor="request-date">Preferred date</FormLabel>
                    <Input id="request-date" type="date" value={dateVal} onChange={e => setDateVal(e.target.value)}
                      min={new Date().toISOString().split('T')[0]} {...inputStyle} />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="request-time">Preferred time</FormLabel>
                    <Input id="request-time" type="time" value={timeVal} onChange={e => setTimeVal(e.target.value)} {...inputStyle} />
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  <Box>
                    <Text {...LABEL_STYLE}>Bedrooms</Text>
                    <HStack w="fit-content" gap={0} border="1px solid #CBD8E0" borderRadius="5px" overflow="hidden">
                      <Button type="button" aria-label="Remove one bedroom" onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                        variant="ghost" h="44px" minW="46px" px={0} color="#1E3A5F" fontSize="20px" fontWeight="400" borderRadius={0}
                        _hover={{ bg: '#EDF3F5' }} _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '-3px' }}>−</Button>
                      <Text minW="44px" textAlign="center" fontSize="15px" fontWeight="800" fontFamily="heading" aria-live="polite">{bedrooms}</Text>
                      <Button type="button" aria-label="Add one bedroom" onClick={() => setBedrooms(bedrooms + 1)}
                        variant="ghost" h="44px" minW="46px" px={0} color="#1E3A5F" fontSize="20px" fontWeight="400" borderRadius={0}
                        _hover={{ bg: '#EDF3F5' }} _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '-3px' }}>+</Button>
                    </HStack>
                  </Box>
                  <Box>
                    <Text {...LABEL_STYLE}>Bathrooms</Text>
                    <HStack w="fit-content" gap={0} border="1px solid #CBD8E0" borderRadius="5px" overflow="hidden">
                      <Button type="button" aria-label="Remove one bathroom" onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                        variant="ghost" h="44px" minW="46px" px={0} color="#1E3A5F" fontSize="20px" fontWeight="400" borderRadius={0}
                        _hover={{ bg: '#EDF3F5' }} _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '-3px' }}>−</Button>
                      <Text minW="44px" textAlign="center" fontSize="15px" fontWeight="800" fontFamily="heading" aria-live="polite">{bathrooms}</Text>
                      <Button type="button" aria-label="Add one bathroom" onClick={() => setBathrooms(bathrooms + 1)}
                        variant="ghost" h="44px" minW="46px" px={0} color="#1E3A5F" fontSize="20px" fontWeight="400" borderRadius={0}
                        _hover={{ bg: '#EDF3F5' }} _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '-3px' }}>+</Button>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Box>

            <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
              <HStack align="start" gap={4} mb={6}>
                <Text fontSize="13px" fontWeight="800" color="#9B7C24" fontFamily="heading" pt={1}>03</Text>
                <Box>
                  <Text as="h2" fontSize={{ base: '21px', md: '24px' }} fontWeight="800" letterSpacing="-.03em" fontFamily="heading" lineHeight="1.2">Make it yours</Text>
                  <Text mt={1} fontSize="13px" color="#60758A" fontFamily="heading">Choose a schedule and anything extra.</Text>
                </Box>
              </HStack>
              <VStack gap={6} align="stretch">
                <Box>
                  <Text {...LABEL_STYLE}>How often?</Text>
                  <SimpleGrid columns={{ base: 1, sm: 3 }} gap={2}>
                    {FREQUENCY_OPTIONS.map(f => {
                      const selected = frequency === f.id;
                      return (
                        <Button type="button" variant="plain" key={f.id} aria-pressed={selected} onClick={() => setFrequency(f.id)}
                          minH="48px" px={3} py={2} bg={selected ? '#1E3A5F' : '#FFFFFF'} color={selected ? '#FFFFFF' : '#1E3A5F'}
                          border="1px solid" borderColor={selected ? '#1E3A5F' : '#CBD8E0'} borderRadius="5px"
                          textAlign="center" fontSize="13px" fontWeight="800" fontFamily="heading" cursor="pointer"
                          _hover={{ borderColor: '#1E3A5F', bg: selected ? '#29496E' : '#EDF3F5' }}
                          _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '2px' }}>
                          {f.labelEn}{f.tag && <Text as="span" ml={1.5} color={selected ? '#E9D68B' : '#8A6E1E'} fontSize="11px">{f.tag}</Text>}
                        </Button>
                      );
                    })}
                  </SimpleGrid>
                </Box>
                <Box>
                  <Text {...LABEL_STYLE}>Add-ons <Text as="span" textTransform="none" letterSpacing="normal" color="#6A8092" fontWeight="500">(optional)</Text></Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
                    {EXTRAS.map(ex => {
                      const selected = extras.includes(ex.id);
                      return (
                        <Button type="button" variant="plain" key={ex.id} aria-pressed={selected} onClick={() => toggleExtra(ex.id)}
                          px={4} py={3} textAlign="left" minH="57px" bg={selected ? '#F8F4E7' : '#FFFFFF'}
                          border="1px solid" borderColor={selected ? '#B89631' : '#DDE5E9'} borderRadius="5px" cursor="pointer"
                          _hover={{ borderColor: '#B89631' }} _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '2px' }}>
                          <Flex justify="space-between" align="center" gap={3}>
                            <Box>
                              <Text fontSize="13px" fontWeight="800" fontFamily="heading" color="#1E3A5F">{ex.labelEn}</Text>
                              <Text fontSize="12px" fontFamily="heading" color="#60758A">+{'$'}{ex.price}</Text>
                            </Box>
                            <Flex w="19px" h="19px" flexShrink={0} align="center" justify="center" border="1.5px solid"
                              borderColor={selected ? '#B89631' : '#A7BAC6'} bg={selected ? '#D4AF37' : '#FFFFFF'} borderRadius="3px">
                              {selected && <Icon as={LucideCheck} boxSize="13px" color="#1E3A5F" />}
                            </Flex>
                          </Flex>
                        </Button>
                      );
                    })}
                  </SimpleGrid>
                </Box>
                <Box>
                  <FormLabel htmlFor="request-notes">Anything else we should know? <Text as="span" textTransform="none" letterSpacing="normal" color="#6A8092" fontWeight="500">(optional)</Text></FormLabel>
                  <Textarea id="request-notes" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="For example, pets at home, parking details, or areas to focus on."
                    bg="#FFFFFF" border="1px solid #CBD8E0" borderRadius="5px" color="#1E3A5F" fontFamily="heading"
                    fontSize="14px" rows={3} px={3.5} py={3}
                    _placeholder={{ color: '#7B8DA0' }} _focusVisible={{ borderColor: '#1E3A5F', boxShadow: '0 0 0 3px rgba(212,175,55,.28)' }} />
                </Box>

                <Box display={{ base: 'block', lg: 'none' }}>{estimateSummary}</Box>

                {!showRegister ? (
                  <Box pt={1}>
                    <Button onClick={handleSubmit} bg="#D4AF37" color="#1E3A5F" minH="52px" w={{ base: 'full', sm: 'auto' }}
                      px={7} borderRadius="5px" fontWeight="800" fontSize="14px" fontFamily="heading"
                      _hover={{ bg: '#E5C562' }} _focusVisible={{ outline: '3px solid #1E3A5F', outlineOffset: '3px' }}
                      loading={loading}>
                      Continue to send request <Icon as={LucideArrowRight} boxSize="17px" ml={2} />
                    </Button>
                    <Text mt={3} fontSize="12px" color="#60758A" fontFamily="heading">Free to request. You decide before booking.</Text>
                  </Box>
                ) : (
                  <Text fontSize="13px" color="#365878" fontFamily="heading" fontWeight="700">
                    Your details are saved below. Finish the account step to send your request.
                  </Text>
                )}
              </VStack>
            </Box>
          </Box>

          <Box display={{ base: 'none', lg: 'block' }} w="310px" flexShrink={0} position="sticky" top="100px">
            {estimateSummary}
            <HStack align="start" gap={2.5} mt={5} px={1}>
              <Icon as={LucideCheckCircle} boxSize="17px" mt="2px" color="#568679" />
              <Text fontSize="12px" lineHeight="1.55" color="#526A7F" fontFamily="heading">
                Sending a request is free. You only proceed when the details feel right.
              </Text>
            </HStack>
          </Box>
        </Flex>

        <AnimatePresence>
          {showRegister && (
            <motion.div id="register-section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} style={{ scrollMarginTop: '95px' }}>
              <Box mt={8} maxW="812px" bg="#FFFFFF" border="1px solid #DDE5E9" borderTop="3px solid #D4AF37" borderRadius="6px" overflow="hidden">
                <Box px={{ base: 5, md: 8 }} pt={{ base: 6, md: 8 }} pb={5}>
                  <HStack align="start" gap={4}>
                    <Text fontSize="13px" fontWeight="800" color="#9B7C24" fontFamily="heading" pt={1}>04</Text>
                    <Box>
                      <Text as="h2" fontSize={{ base: '21px', md: '24px' }} fontWeight="800" letterSpacing="-.03em" fontFamily="heading" lineHeight="1.2">
                        Send your request
                      </Text>
                      <Text mt={1} color="#60758A" fontSize="13px" fontFamily="heading">Create an account or sign in to finish.</Text>
                    </Box>
                  </HStack>
                </Box>
                <HStack gap={0} px={{ base: 5, md: 8 }} borderBottom="1px solid #DDE5E9">
                  <Button type="button" variant="plain" flex={1} textAlign="center" minH="50px" px={2} py={3}
                    borderBottom="2px solid" borderBottomColor={authMode === 'register' ? '#1E3A5F' : 'transparent'}
                    color={authMode === 'register' ? '#1E3A5F' : '#60758A'} fontSize="13px"
                    fontWeight={authMode === 'register' ? '800' : '600'} fontFamily="heading" cursor="pointer"
                    aria-pressed={authMode === 'register'} onClick={() => setAuthMode('register')}
                    _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '-3px' }}>
                    Create account
                  </Button>
                  <Button type="button" variant="plain" flex={1} textAlign="center" minH="50px" px={2} py={3}
                    borderBottom="2px solid" borderBottomColor={authMode === 'login' ? '#1E3A5F' : 'transparent'}
                    color={authMode === 'login' ? '#1E3A5F' : '#60758A'} fontSize="13px"
                    fontWeight={authMode === 'login' ? '800' : '600'} fontFamily="heading" cursor="pointer"
                    aria-pressed={authMode === 'login'} onClick={() => setAuthMode('login')}
                    _focusVisible={{ outline: '3px solid #D4AF37', outlineOffset: '-3px' }}>
                    Sign in
                  </Button>
                </HStack>

                <Box px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
                  {authMode === 'register' ? (
                    <>
                      <Text fontSize="14px" fontWeight="800" fontFamily="heading" mb={1}>Your contact details</Text>
                      <Text fontSize="13px" color="#60758A" fontFamily="heading" mb={5}>
                        Your request will be sent after your free account is created.
                      </Text>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={4}>
                        <Box>
                          <FormLabel htmlFor="register-name">Full name</FormLabel>
                          <HStack gap={2}>
                            <Icon as={LucideUser} boxSize="17px" color="#60758A" flexShrink={0} />
                            <Input id="register-name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" {...inputStyle} />
                          </HStack>
                        </Box>
                        <Box>
                          <FormLabel htmlFor="register-phone">Phone number</FormLabel>
                          <HStack gap={2}>
                            <Icon as={LucidePhone} boxSize="17px" color="#60758A" flexShrink={0} />
                            <Input id="register-phone" value={regPhone}
                              onChange={e => {
                                let v = e.target.value;
                                if (!v.startsWith('+1 ')) v = '+1 ';
                                const digits = v.slice(3).replace(/\D/g, '').slice(0, 10);
                                const fmt = digits.replace(/(\d{3})(\d{3})(\d{1,4})/, '($1) $2-$3')
                                                  .replace(/(\d{3})(\d{1,3})$/, '($1) $2')
                                                  .replace(/^(\d{1,3})$/, '($1');
                                setRegPhone('+1 ' + fmt);
                              }}
                              placeholder="+1 (555) 000-0000" {...inputStyle} />
                          </HStack>
                        </Box>
                      </SimpleGrid>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={6}>
                        <Box>
                          <FormLabel htmlFor="register-email">Email address</FormLabel>
                          <HStack gap={2}>
                            <Icon as={LucideMail} boxSize="17px" color="#60758A" flexShrink={0} />
                            <Input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com" {...inputStyle} />
                          </HStack>
                        </Box>
                        <Box>
                          <FormLabel htmlFor="register-password">Create a password</FormLabel>
                          <HStack gap={2}>
                            <Icon as={LucideLock} boxSize="17px" color="#60758A" flexShrink={0} />
                            <Input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                              placeholder="At least 8 characters" {...inputStyle} />
                          </HStack>
                        </Box>
                      </SimpleGrid>
                      <Button onClick={handleRegisterAndSubmit} bg="#D4AF37" color="#1E3A5F" minH="52px"
                        w={{ base: 'full', sm: 'auto' }} px={7} borderRadius="5px" fontWeight="800" fontSize="14px" fontFamily="heading"
                        _hover={{ bg: '#E5C562' }} _focusVisible={{ outline: '3px solid #1E3A5F', outlineOffset: '3px' }}
                        loading={loading} loadingText="Setting up your account…">
                        <Icon as={LucideCheckCircle} boxSize="17px" mr={2} /> Create account and send request
                      </Button>
                    </>
                  ) : (
                    <>
                      <Text fontSize="14px" fontWeight="800" fontFamily="heading" mb={1}>Welcome back</Text>
                      <Text fontSize="13px" color="#60758A" fontFamily="heading" mb={5}>
                        Your request will be sent after you sign in.
                      </Text>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={6}>
                        <Box>
                          <FormLabel htmlFor="login-email">Email address</FormLabel>
                          <HStack gap={2}>
                            <Icon as={LucideMail} boxSize="17px" color="#60758A" flexShrink={0} />
                            <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                              placeholder="you@example.com" {...inputStyle} />
                          </HStack>
                        </Box>
                        <Box>
                          <FormLabel htmlFor="login-password">Password</FormLabel>
                          <HStack gap={2}>
                            <Icon as={LucideLock} boxSize="17px" color="#60758A" flexShrink={0} />
                            <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                              placeholder="Your password" {...inputStyle} />
                          </HStack>
                        </Box>
                      </SimpleGrid>
                      <Button onClick={handleLoginAndSubmit} bg="#D4AF37" color="#1E3A5F" minH="52px"
                        w={{ base: 'full', sm: 'auto' }} px={7} borderRadius="5px" fontWeight="800" fontSize="14px" fontFamily="heading"
                        _hover={{ bg: '#E5C562' }} _focusVisible={{ outline: '3px solid #1E3A5F', outlineOffset: '3px' }}
                        loading={loading} loadingText="Signing in…">
                        Sign in and send request <Icon as={LucideArrowRight} boxSize="17px" ml={2} />
                      </Button>
                      <Text fontSize="12px" color="#60758A" fontFamily="heading" mt={4}>
                        Forgot your password?{' '}
                        <NextLink href="/auth/login">
                          <Text as="span" color="#1E3A5F" fontWeight="800" cursor="pointer" textDecoration="underline" textUnderlineOffset="3px">Go to login page</Text>
                        </NextLink>
                      </Text>
                    </>
                  )}
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <Flex mt={{ base: 12, md: 16 }} pt={5} borderTop="1px solid #DDE5E9" justify="space-between" align="center" gap={4} flexWrap="wrap">
          <Text fontFamily="heading" fontSize="13px" color="#60758A">Verliks · A clearer way to find cleaning help.</Text>
          <HStack gap={5} fontFamily="heading" fontSize="13px" color="#1E3A5F" fontWeight="700">
            <NextLink href="/how-it-works">How it works</NextLink>
            <NextLink href="/contact">Contact</NextLink>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}

export default function RequestPage() {
  return (
    <Suspense>
      <RequestForm />
    </Suspense>
  );
}
