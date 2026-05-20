'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Flex, Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight, LucideCheckCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });

    if (result?.error) {
      if (result.error.includes('EMAIL_NOT_VERIFIED')) {
        toaster.create({
          title: 'Email not verified',
          description: 'Please verify your email before signing in.',
          type: 'warning',
        });
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else if (result.error.includes('ACCOUNT_SUSPENDED')) {
        toaster.create({ title: 'Account suspended', description: 'Your account has been suspended. Please contact support.', type: 'error' });
      } else {
        toaster.create({ title: 'Sign in failed', description: 'Invalid email or password.', type: 'error' });
      }
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

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
            <Box w="32px" h="32px" bg="#0A80DB" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="11px" letterSpacing="-0.02em" fontFamily="heading">BC</Text>
            </Box>
            <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>

          <Box>
            <Text
              fontSize="10.5px" fontWeight="700" letterSpacing="0.14em"
              color="#0A80DB" textTransform="uppercase" fontFamily="heading" mb={4}
              style={{ borderLeft: '2px solid #0A80DB', paddingLeft: 10 }}
            >
              Trusted by homeowners
            </Text>
            <Text fontSize="26px" fontWeight="800" color="white" fontFamily="heading"
              letterSpacing="-0.03em" lineHeight="1.15" mb={6}>
              Your home,<br />in trusted hands.
            </Text>
            <VStack align="stretch" gap={2.5}>
              {[
                'Background-checked cleaners',
                'Secure payments & satisfaction guarantee',
                '4.9 stars across 1,000+ reviews',
              ].map(t => (
                <HStack key={t} gap={2}>
                  <Icon as={LucideCheckCircle} w="14px" h="14px" color="#0A80DB" flexShrink={0} />
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
            <Box w="28px" h="28px" bg="#0A80DB" style={{ borderRadius: 4 }}
              display="flex" alignItems="center" justifyContent="center">
              <Text color="white" fontWeight="800" fontSize="10px" fontFamily="heading">BC</Text>
            </Box>
            <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="#0B1120" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>

          <Box mb={8}>
            <Text fontSize="24px" fontWeight="800" color="#0B1120" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Welcome back
            </Text>
            <Text fontSize="14px" color="#64748B" fontFamily="heading">
              Sign in to your account to continue.
            </Text>
          </Box>

          <form onSubmit={handleLogin}>
            <VStack gap={5} align="stretch">

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
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                  type="email"
                  required
                />
              </Box>

              <Box>
                <Flex justify="space-between" align="center" mb={1.5}>
                  <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase"
                    letterSpacing="0.1em" fontFamily="heading">Password</Text>
                  <NextLink href="/auth/forgot-password">
                    <Text fontSize="12px" color="#0A80DB" fontWeight="600" cursor="pointer"
                      fontFamily="heading" _hover={{ color: '#0870C2' }}>Forgot password?</Text>
                  </NextLink>
                </Flex>
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
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                  required
                />
              </Box>

              <Button
                type="submit"
                bg="#0A80DB"
                color="white"
                h="44px"
                borderRadius="4px"
                fontWeight="700"
                fontSize="14px"
                fontFamily="heading"
                _hover={{ bg: '#0870C2' }}
                transition="background 0.15s"
                loading={loading}
                loadingText="Signing in…"
                mt={1}
              >
                Sign in to BrazilianClean
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

            </VStack>
          </form>

          <Box mt={7} pt={6} borderTop="1px solid #E2E8F0">
            <Text fontSize="13px" color="#64748B" fontFamily="heading" textAlign="center">
              Don&apos;t have an account?{' '}
              <NextLink href="/auth/register">
                <Text as="span" color="#0A80DB" fontWeight="700" cursor="pointer"
                  _hover={{ color: '#0870C2' }}>Create free account</Text>
              </NextLink>
            </Text>
          </Box>

        </Box>
      </Flex>

    </Flex>
  );
}
