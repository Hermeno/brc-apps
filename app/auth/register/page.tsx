'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Flex, Icon,
} from '@chakra-ui/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight, LucideCheckCircle } from 'lucide-react';

function RegisterForm() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<'CLIENT' | 'CLEANER'>('CLIENT');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedRole = searchParams.get('role') === 'cleaner';

  useEffect(() => {
    if (forcedRole) setRole('CLEANER');
  }, [forcedRole]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.ok) {
        if (role === 'CLIENT') {
          const login = await signIn('credentials', { email, password, redirect: false });
          if (login?.ok) {
            router.push('/dashboard/client');
          } else {
            router.push('/auth/login');
          }
        } else {
          toaster.create({ title: 'Account created!', description: 'Check your email to activate.', type: 'success' });
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error: any) {
      toaster.create({ title: 'Error', description: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isCleaner = role === 'CLEANER';

  return (
    <Flex minH="100vh">

      {/* ── Left panel ── */}
      <Box
        display={{ base: 'none', lg: 'flex' }} flexDirection="column"
        w="480px" flexShrink={0} bg="#0B1120" position="relative" overflow="hidden"
      >
        <Box
          position="absolute" inset={0}
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box position="absolute" inset={0} style={{ background: 'linear-gradient(180deg, rgba(11,17,32,0.88) 0%, rgba(11,17,32,0.60) 50%, rgba(11,17,32,0.88) 100%)' }} />

        <Flex direction="column" justify="space-between" h="full" position="relative" p={10}>
          <HStack gap={2.5}>
            <Box w="32px" h="32px" bg="#1A7FA0" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="11px" letterSpacing="-0.02em" fontFamily="heading">BC</Text>
            </Box>
            <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="#1A7FA0">Clean</Text>
            </Text>
          </HStack>

          <Box>
            <Text
              fontSize="10.5px" fontWeight="700" letterSpacing="0.14em"
              color="#1A7FA0" textTransform="uppercase" fontFamily="heading" mb={4}
              style={{ borderLeft: '2px solid #1A7FA0', paddingLeft: 10 }}
            >
              {forcedRole ? 'For professionals' : 'For clients & professionals'}
            </Text>
            <Text fontSize="26px" fontWeight="800" color="white" fontFamily="heading"
              letterSpacing="-0.03em" lineHeight="1.15" mb={6}>
              {forcedRole
                ? 'Get clients.\nGrow your business.'
                : 'Professional cleaning\nat your door.'}
            </Text>
            <VStack align="stretch" gap={2.5}>
              {(forcedRole
                ? [
                    'Direct leads in your area',
                    'Guaranteed payment on the platform',
                    'Verified profile with priority visibility',
                  ]
                : [
                    'Identity-verified professionals',
                    'Secure and guaranteed payments',
                    '4.9 average star rating',
                  ]
              ).map(t => (
                <HStack key={t} gap={2}>
                  <Icon as={LucideCheckCircle} w="14px" h="14px" color="#1A7FA0" flexShrink={0} />
                  <Text fontSize="13px" color="rgba(255,255,255,0.65)" fontFamily="heading">{t}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Flex>
      </Box>

      {/* ── Right panel — form ── */}
      <Flex flex={1} bg="white" alignItems="center" justifyContent="center" px={{ base: 5, md: 12 }} py={12}>
        <Box w="full" maxW="400px">

          {/* Mobile logo */}
          <HStack gap={2.5} mb={10} display={{ base: 'flex', lg: 'none' }}>
            <Box w="28px" h="28px" bg="#1A7FA0" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="10px" fontFamily="heading">BC</Text>
            </Box>
            <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="#0B1120" fontFamily="heading">
              Brazilian<Text as="span" color="#1A7FA0">Clean</Text>
            </Text>
          </HStack>

          <Box mb={8}>
            <Text fontSize="24px" fontWeight="800" color="#0B1120" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              {forcedRole ? 'Professional sign up' : 'Create free account'}
            </Text>
            <Text fontSize="14px" color="#64748B" fontFamily="heading">
              {forcedRole
                ? 'Join the platform and start receiving clients.'
                : 'The #1 cleaning platform in the US.'}
            </Text>
          </Box>

          <form onSubmit={handleRegister}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>Full name</Text>
                <Input
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  bg="#F8FAFC"
                  border="1px solid"
                  borderColor="#E2E8F0"
                  h="44px"
                  borderRadius="4px"
                  fontFamily="heading"
                  fontSize="14px"
                  _focus={{ bg: 'white', borderColor: '#1A7FA0' }}
                  required
                />
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>Email</Text>
                <Input
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  bg="#F8FAFC"
                  border="1px solid"
                  borderColor="#E2E8F0"
                  h="44px"
                  borderRadius="4px"
                  fontFamily="heading"
                  fontSize="14px"
                  _focus={{ bg: 'white', borderColor: '#1A7FA0' }}
                  type="email"
                  required
                />
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>Password</Text>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  bg="#F8FAFC"
                  border="1px solid"
                  borderColor="#E2E8F0"
                  h="44px"
                  borderRadius="4px"
                  fontFamily="heading"
                  fontSize="14px"
                  _focus={{ bg: 'white', borderColor: '#1A7FA0' }}
                  required
                />
              </Box>

              <Button
                type="submit"
                bg={isCleaner ? '#1A7FA0' : '#0B1120'}
                color="white"
                h="44px"
                borderRadius="4px"
                fontWeight="700"
                fontSize="14px"
                fontFamily="heading"
                _hover={{ bg: isCleaner ? '#15698A' : '#1a2744' }}
                transition="background 0.15s"
                loading={loading}
                loadingText="Creating account…"
                mt={1}
              >
                {isCleaner ? 'Sign up as professional' : 'Create account on BrazilianClean'}
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

            </VStack>
          </form>

          <Box mt={7} pt={6} borderTop="1px solid #E2E8F0" display="flex" flexDirection="column" gap={3}>
            <Text fontSize="13px" color="#64748B" fontFamily="heading" textAlign="center">
              Already have an account?{' '}
              <NextLink href="/auth/login">
                <Text as="span" color="#1A7FA0" fontWeight="700" cursor="pointer"
                  _hover={{ color: '#15698A' }}>Sign in</Text>
              </NextLink>
            </Text>
            <Text fontSize="13px" color="#64748B" fontFamily="heading" textAlign="center">
              {forcedRole ? 'Need cleaning?' : 'Are you a cleaning professional?'}{' '}
              <NextLink href={forcedRole ? '/auth/register' : '/auth/register?role=cleaner'}>
                <Text as="span" color="#64748B" fontWeight="700" cursor="pointer"
                  textDecoration="underline" _hover={{ color: '#0B1120' }}>
                  {forcedRole ? 'Sign up as customer' : 'Sign up as professional'}
                </Text>
              </NextLink>
            </Text>
          </Box>

        </Box>
      </Flex>

    </Flex>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
