'use client';

import { useState, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box, Flex, VStack, HStack, Text, Button, Input, Textarea,
  Container, Icon, SimpleGrid,
} from '@chakra-ui/react';
import {
  LucideArrowRight, LucideMapPin, LucideCalendar, LucideBanknote,
  LucideClock, LucideUser, LucideLock, LucideMail, LucideCheckCircle, LucidePhone,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import NextLink from 'next/link';
import { SERVICE_TYPES, FREQUENCY_OPTIONS, EXTRAS, calculateEstimate } from '@/lib/estimate';
import { toaster } from '@/lib/toaster';
import { AddressInput } from '@/components/address-input';
import Image from 'next/image';

const LABEL_STYLE = {
  fontSize: '11px' as const,
  fontWeight: '700' as const,
  color: '#64748B',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  fontFamily: 'heading',
  marginBottom: '6px',
};

export default function RequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [serviceType, setServiceType]   = useState('standard');
  const [address, setAddress]           = useState('');
  const [dateTime, setDateTime]         = useState('');
  const [bedrooms, setBedrooms]         = useState(2);
  const [bathrooms, setBathrooms]       = useState(1);
  const [squareMeters, setSquareMeters] = useState(0);
  const [extras, setExtras]             = useState<string[]>([]);
  const [frequency, setFrequency]       = useState('once');
  const [notes, setNotes]               = useState('');
  const [phone, setPhone]               = useState('+1 ');

  const [showRegister, setShowRegister] = useState(false);
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);

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
        squareMeters, extras, frequency, notes, clientPhone: phone,
        estimatedMinPrice: estimate.minPrice,
        estimatedMaxPrice: estimate.maxPrice,
        estimatedHours: estimate.hours,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Failed to submit request');
    }
  };

  const handleSubmit = async () => {
    if (!address.trim() || !dateTime) {
      toaster.create({ title: 'Please fill in address and date', type: 'error' });
      return;
    }
    if (phone.trim().length < 16) {
      toaster.create({ title: 'Please enter your contact phone number', type: 'error' });
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
      toaster.create({ title: 'Please fill in all fields', type: 'error' });
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
        throw new Error(d.error || 'Failed to create account');
      }
      const loginRes = await signIn('credentials', { email, password, redirect: false });
      if (!loginRes?.ok) throw new Error('Login failed');
      await submitLead();
      router.push('/dashboard/client');
    } catch (err: any) {
      toaster.create({ title: err.message, type: 'error' });
    } finally { setLoading(false); }
  };

  const inputStyle = {
    bg: '#F8FAFC',
    border: '1px solid',
    borderColor: '#E3E8EE',
    h: '44px',
    borderRadius: '4px',
    fontFamily: 'heading',
    fontSize: '14px',
    _focus: { bg: 'white', borderColor: '#0A80DB' },
  } as const;

  return (
    <Box minH="100vh" bg="white">

      {/* Navbar */}
      <Box
        bg="#0B1120" borderBottom="1px solid rgba(255,255,255,0.06)"
        position="sticky" top={0} zIndex={50} h="64px"
      >
        <Flex align="center" h="full" px={{ base: 5, md: 10, lg: 16 }} maxW="1440px" mx="auto" justify="space-between">
          <NextLink href="/">
            <HStack gap={2.5} cursor="pointer">
              <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="white" fontFamily="heading">
                Brazilian<Text as="span" color="#0A80DB">Clean</Text>
              </Text>
            </HStack>
          </NextLink>
          <NextLink href="/auth/login">
            <Text fontSize="13px" fontWeight="600" color="rgba(255,255,255,0.55)" cursor="pointer" fontFamily="heading"
              _hover={{ color: 'white' }} transition="color 0.15s">
              Already have an account? Sign in
            </Text>
          </NextLink>
        </Flex>
      </Box>

      <Container maxW="6xl" py={10}>
        <Box mb={10}>
          <Text
            fontSize="10.5px" fontWeight="700" letterSpacing="0.14em"
            color="#0A80DB" textTransform="uppercase" fontFamily="heading" mb={2}
            style={{ borderLeft: '2px solid #0A80DB', paddingLeft: 10 }}
          >
            New booking
          </Text>
          <Text fontSize={{ base: '26px', md: '32px' }} fontWeight="800" color="#0A2540"
            fontFamily="heading" letterSpacing="-0.025em">
            Request Cleaning
          </Text>
          <Text fontSize="14px" color="#425466" fontFamily="heading" mt={1}>
            Fill in the details and get matched with vetted cleaners near you.
          </Text>
        </Box>

        <Flex gap={8} align="start" direction={{ base: 'column', lg: 'row' }}>

          {/* ── Form card ── */}
          <Box flex={1} bg="white" border="1px solid #E3E8EE" p={8} style={{ borderRadius: 8 }}>
            <VStack gap={7} align="stretch">

              {/* Service type */}
              <Box>
                <Text {...LABEL_STYLE}>Cleaning type</Text>
                <SimpleGrid columns={2} gap={2}>
                  {SERVICE_TYPES.map(s => (
                    <Box
                      key={s.id}
                      onClick={() => setServiceType(s.id)}
                      cursor="pointer"
                      bg={serviceType === s.id ? '#EFF8FB' : '#F8FAFC'}
                      border="1px solid"
                      borderColor={serviceType === s.id ? '#0A80DB' : '#E3E8EE'}
                      borderLeft={serviceType === s.id ? '3px solid #0A80DB' : '3px solid transparent'}
                      p={3}
                      transition="all 0.15s"
                    >
                      <HStack gap={2}>
                        <Text fontSize="xl">{s.icon}</Text>
                        <Box>
                          <Text fontSize="13px" fontWeight="700" fontFamily="heading"
                            color={serviceType === s.id ? '#0A80DB' : '#0B1120'}>{s.labelEn}</Text>
                          <Text fontSize="12px" color="#697386" fontFamily="heading">{s.descEn}</Text>
                        </Box>
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Address */}
              <Box>
                <Text {...LABEL_STYLE}>Service address</Text>
                <AddressInput
                  value={address}
                  onChange={setAddress}
                  placeholder="123 Main St, Miami, FL 33101"
                  inputProps={inputStyle}
                />
              </Box>

              {/* Phone */}
              <Box>
                <Text {...LABEL_STYLE}>Contact phone</Text>
                <HStack>
                  <Icon as={LucidePhone} color="#0A80DB" w="15px" h="15px" flexShrink={0} />
                  <Input
                    value={phone}
                    onChange={e => {
                      let v = e.target.value;
                      if (!v.startsWith('+1 ')) v = '+1 ';
                      const digits = v.slice(3).replace(/\D/g, '').slice(0, 10);
                      const fmt = digits.replace(/(\d{3})(\d{3})(\d{1,4})/, '($1) $2-$3')
                                        .replace(/(\d{3})(\d{1,3})$/, '($1) $2')
                                        .replace(/^(\d{1,3})$/, '($1');
                      setPhone('+1 ' + fmt);
                    }}
                    placeholder="+1 (555) 000-0000"
                    {...inputStyle}
                  />
                </HStack>
              </Box>

              {/* Date */}
              <Box>
                <Text {...LABEL_STYLE}>Date and time</Text>
                <HStack>
                  <Icon as={LucideCalendar} color="#0A80DB" w="15px" h="15px" flexShrink={0} />
                  <Input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)}
                    {...inputStyle} />
                </HStack>
              </Box>

              {/* Rooms */}
              <SimpleGrid columns={2} gap={4}>
                <Box>
                  <Text {...LABEL_STYLE}>Bedrooms</Text>
                  <HStack gap={2}>
                    <Button size="sm" variant="outline" borderRadius="4px"
                      onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}
                      h="32px" minW="32px" px={0} fontFamily="heading">−</Button>
                    <Text fontWeight="700" minW="8" textAlign="center" fontFamily="heading">{bedrooms}</Text>
                    <Button size="sm" variant="outline" borderRadius="4px"
                      onClick={() => setBedrooms(bedrooms + 1)}
                      h="32px" minW="32px" px={0} fontFamily="heading">+</Button>
                  </HStack>
                </Box>
                <Box>
                  <Text {...LABEL_STYLE}>Bathrooms</Text>
                  <HStack gap={2}>
                    <Button size="sm" variant="outline" borderRadius="4px"
                      onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                      h="32px" minW="32px" px={0} fontFamily="heading">−</Button>
                    <Text fontWeight="700" minW="8" textAlign="center" fontFamily="heading">{bathrooms}</Text>
                    <Button size="sm" variant="outline" borderRadius="4px"
                      onClick={() => setBathrooms(bathrooms + 1)}
                      h="32px" minW="32px" px={0} fontFamily="heading">+</Button>
                  </HStack>
                </Box>
              </SimpleGrid>

              {/* Frequency */}
              <Box>
                <Text {...LABEL_STYLE}>Frequency</Text>
                <HStack gap={2} flexWrap="wrap">
                  {FREQUENCY_OPTIONS.map(f => (
                    <Button
                      key={f.id}
                      size="sm"
                      onClick={() => setFrequency(f.id)}
                      bg={frequency === f.id ? '#0B1120' : '#F8FAFC'}
                      color={frequency === f.id ? 'white' : '#64748B'}
                      borderRadius="4px"
                      border="1px solid"
                      borderColor={frequency === f.id ? '#0B1120' : '#E3E8EE'}
                      fontWeight="600"
                      fontSize="13px"
                      fontFamily="heading"
                      h="34px"
                      px={4}
                      _hover={{ borderColor: '#0B1120' }}
                      transition="all 0.15s"
                    >
                      {f.labelEn}
                      {f.tag && (
                        <Box
                          as="span" ml={1.5}
                          bg="#34D399" color="white"
                          fontSize="10px" fontWeight="700" px={1.5} py={0.5}
                          style={{ borderRadius: 3 }}
                        >
                          {f.tag}
                        </Box>
                      )}
                    </Button>
                  ))}
                </HStack>
              </Box>

              {/* Extras */}
              <Box>
                <Text {...LABEL_STYLE}>Extras (optional)</Text>
                <SimpleGrid columns={2} gap={2}>
                  {EXTRAS.map(ex => (
                    <Box
                      key={ex.id}
                      onClick={() => toggleExtra(ex.id)}
                      cursor="pointer"
                      bg={extras.includes(ex.id) ? '#FEFCE8' : '#F8FAFC'}
                      border="1px solid"
                      borderColor={extras.includes(ex.id) ? '#FCD34D' : '#E3E8EE'}
                      borderLeft={extras.includes(ex.id) ? '3px solid #FCD34D' : '3px solid transparent'}
                      px={3} py={2.5}
                      transition="all 0.15s"
                    >
                      <HStack gap={2}>
                        <Text fontSize="lg" lineHeight={1}>{ex.icon}</Text>
                        <Box flex={1}>
                          <Text fontSize="12px" fontWeight="700" fontFamily="heading"
                            color={extras.includes(ex.id) ? '#92400E' : '#0B1120'}>{ex.labelEn}</Text>
                          <Text fontSize="11px" color="#697386" fontFamily="heading">+${ex.price}</Text>
                        </Box>
                        {extras.includes(ex.id) && (
                          <Icon as={LucideCheckCircle} w="14px" h="14px" color="#D97706" />
                        )}
                      </HStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Notes */}
              <Box>
                <Text {...LABEL_STYLE}>Notes (optional)</Text>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="E.g., I have pets, gate access on the side…"
                  bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" borderRadius="4px"
                  fontFamily="heading" fontSize="14px" rows={3}
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }} />
              </Box>

              {/* Submit */}
              {!showRegister && (
                <Button
                  onClick={handleSubmit}
                  bg="#0A80DB" color="white" h="44px"
                  borderRadius="4px" fontWeight="700" fontSize="14px" fontFamily="heading"
                  _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                  loading={loading}
                >
                  Book now
                  <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
                </Button>
              )}

            </VStack>
          </Box>

          {/* ── Estimate sidebar ── */}
          <Box w={{ base: 'full', lg: '280px' }} position={{ lg: 'sticky' }} top="80px">
            <Box bg="white" border="1px solid #E3E8EE" p={6} style={{ borderRadius: 8 }}>
              <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                letterSpacing="0.1em" fontFamily="heading" mb={4}>
                Price estimate
              </Text>
              <VStack gap={4} align="stretch">

                <Box bg="#EBF5FE" border="1px solid #A2D3F9" p={4}>
                  <HStack gap={2} mb={1}>
                    <Icon as={LucideBanknote} w="15px" h="15px" color="#0A80DB" />
                    <Text fontSize="11px" color="#0A80DB" fontWeight="700" fontFamily="heading">Estimated range</Text>
                  </HStack>
                  <Text fontSize="26px" fontWeight="800" color="#065594" fontFamily="heading" letterSpacing="-0.02em">
                    ${estimate.minPrice}–${estimate.maxPrice}
                  </Text>
                  {estimate.discountPct > 0 && (
                    <Text fontSize="11px" fontWeight="700" color="#0A80DB" fontFamily="heading" mt={1}>
                      {estimate.discountPct}% frequency discount
                    </Text>
                  )}
                </Box>

                <HStack gap={2}>
                  <Icon as={LucideClock} w="14px" h="14px" color="#0A80DB" />
                  <Text fontSize="13px" color="#425466" fontFamily="heading">
                    Estimated duration:{' '}
                    <Text as="span" fontWeight="700" color="#0A2540">~{estimate.hours}h</Text>
                  </Text>
                </HStack>

                <Box bg="#F6F9FC" border="1px solid #E3E8EE" p={3}>
                  <Text fontSize="12px" color="#697386" fontFamily="heading" lineHeight="1.6">
                    Final price is agreed with your cleaner. Estimate is based on the details provided.
                  </Text>
                </Box>

              </VStack>
            </Box>
          </Box>

        </Flex>

        {/* ── Register section (guest) ── */}
        <AnimatePresence>
          {showRegister && (
            <motion.div
              id="register-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <Box mt={6} bg="white" border="1px solid #E3E8EE" borderTop="3px solid #0A80DB" p={8} style={{ borderRadius: 8 }}>
                <Box mb={6}>
                  <Text fontSize="18px" fontWeight="800" color="#0A2540" fontFamily="heading"
                    letterSpacing="-0.02em" mb={1}>
                    Create account to confirm
                  </Text>
                  <Text fontSize="13px" color="#425466" fontFamily="heading">
                    It's free and takes less than 30 seconds. No email verification required.
                  </Text>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={5}>
                  <Box>
                    <Text {...LABEL_STYLE}>Name</Text>
                    <HStack>
                      <Icon as={LucideUser} w="14px" h="14px" color="#697386" flexShrink={0} />
                      <Input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Your name" {...inputStyle} />
                    </HStack>
                  </Box>
                  <Box>
                    <Text {...LABEL_STYLE}>Email</Text>
                    <HStack>
                      <Icon as={LucideMail} w="14px" h="14px" color="#697386" flexShrink={0} />
                      <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com" {...inputStyle} />
                    </HStack>
                  </Box>
                  <Box>
                    <Text {...LABEL_STYLE}>Password</Text>
                    <HStack>
                      <Icon as={LucideLock} w="14px" h="14px" color="#697386" flexShrink={0} />
                      <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" {...inputStyle} />
                    </HStack>
                  </Box>
                </SimpleGrid>

                <Button
                  onClick={handleRegisterAndSubmit}
                  bg="#0A80DB" color="white" h="44px"
                  borderRadius="4px" fontWeight="700" fontSize="14px" fontFamily="heading"
                  _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                  loading={loading} loadingText="Creating account and submitting…"
                >
                  <Icon as={LucideCheckCircle} w={4} h={4} mr={2} />
                  Create account & book now
                </Button>

                <Text fontSize="12px" color="#697386" fontFamily="heading" mt={4}>
                  Already have an account?{' '}
                  <NextLink href="/auth/login">
                    <Text as="span" color="#0A80DB" fontWeight="700" cursor="pointer"
                      _hover={{ color: '#0870C2' }}>Sign in</Text>
                  </NextLink>
                </Text>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

      </Container>
    </Box>
  );
}
