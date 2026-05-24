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
import Image from 'next/image';

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
            backgroundImage: "url('/abc.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Box position="absolute" inset={0} style={{ background: 'linear-gradient(180deg, rgba(11,17,32,0.88) 0%, rgba(11,17,32,0.60) 50%, rgba(11,17,32,0.88) 100%)' }} />

        <Flex direction="column" justify="space-between" h="full" position="relative" p={10}>
          <HStack gap={2.5}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
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
              {forcedRole ? 'For cleaners' : 'For homeowners & cleaners'}
            </Text>
            <Text fontSize="26px" fontWeight="800" color="white" fontFamily="heading"
              letterSpacing="-0.03em" lineHeight="1.15" mb={6}>
              {forcedRole
                ? 'Earn on your schedule.'
                : 'A clean home,\non your schedule.'}
            </Text>
            <VStack align="stretch" gap={2.5}>
              {(forcedRole
                ? [
                    'Get matched with local clients daily',
                    'Secure payments, every job',
                    'Stand out with a verified badge',
                  ]
                : [
                    'Background-checked cleaners',
                    'Secure payments & satisfaction guarantee',
                    '4.9 stars across 1,000+ reviews',
                  ]
              ).map(t => (
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
        <Box w="full" maxW="340px">

          {/* Mobile logo */}
          <HStack gap={2.5} mb={10} display={{ base: 'flex', lg: 'none' }}>
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="#0A2540" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>

          <Box mb={8}>
            <Text fontSize="24px" fontWeight="800" color="#0A2540" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Create free account
            </Text>
            <Text fontSize="14px" color="#425466" fontFamily="heading">
              Choose how you&apos;d like to use BrazilianClean.
            </Text>
          </Box>

          {/* Role selector */}
          <HStack gap={3} mb={6}>
            <Box
              flex={1}
              onClick={() => setRole('CLIENT')}
              border="2px solid"
              borderColor={!isCleaner ? '#0A80DB' : '#E3E8EE'}
              bg="white"
              borderRadius="9999px"
              px={4} py={2.5}
              cursor="pointer"
              transition="border-color 0.15s"
              textAlign="center"
              _hover={{ borderColor: '#0A80DB' }}
            >
              <Text fontWeight="600" fontSize="13px" color={!isCleaner ? '#0A80DB' : '#425466'} fontFamily="heading">
                Book a cleaner
              </Text>
            </Box>
            <Box
              flex={1}
              onClick={() => setRole('CLEANER')}
              border="2px solid"
              borderColor={isCleaner ? '#0A80DB' : '#E3E8EE'}
              bg="white"
              borderRadius="9999px"
              px={4} py={2.5}
              cursor="pointer"
              transition="border-color 0.15s"
              textAlign="center"
              _hover={{ borderColor: '#0A80DB' }}
            >
              <Text fontWeight="600" fontSize="13px" color={isCleaner ? '#0A80DB' : '#425466'} fontFamily="heading">
                Become a cleaner
              </Text>
            </Box>
          </HStack>

          <form onSubmit={handleRegister}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" letterSpacing="-0.01em"
                  fontFamily="heading" mb={1.5}>Full name</Text>
                <Input
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  bg="white"
                  border="1.5px solid ccc"
                  // borderColor="#E3E8EE"
                  h="38px"
                  borderRadius="8px"
                  fontFamily="heading"
                  fontSize="13.5px"
                  color="#0A2540"
                  px={4}
                  _placeholder={{ color: '#B0BAC9' }}
                  _focus={{ borderColor: '#0A80DB', boxShadow: 'none', outline: 'none' }}
                  required
                />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" letterSpacing="-0.01em"
                  fontFamily="heading" mb={1.5}>Email</Text>
                <Input
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  bg="white"
                  border="1.5px solid ccc"
                  // borderColor="#E3E8EE"
                  h="38px"
                  borderRadius="8px"
                  fontFamily="heading"
                  fontSize="13.5px"
                  color="#0A2540"
                  px={4}
                  _placeholder={{ color: '#B0BAC9' }}
                  _focus={{ borderColor: '#0A80DB', boxShadow: 'none', outline: 'none' }}
                  type="email"
                  required
                />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" letterSpacing="-0.01em"
                  fontFamily="heading" mb={1.5}>Password</Text>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  bg="white"
                  border="1.5px solid ccc"
                  // borderColor="#E3E8EE"
                  h="38px"
                  borderRadius="8px"
                  fontFamily="heading"
                  fontSize="13.5px"
                  color="#0A2540"
                  px={4}
                  _placeholder={{ color: '#B0BAC9' }}
                  _focus={{ borderColor: '#0A80DB', boxShadow: 'none', outline: 'none' }}
                  required
                />
              </Box>

              <Button
                type="submit"
                bg={isCleaner ? '#0A80DB' : '#0B1120'}
                color="white"
                h="40px"
                borderRadius="9999px"
                fontWeight="600"
                fontSize="13.5px"
                letterSpacing="-0.01em"
                fontFamily="heading"
                _hover={{ bg: isCleaner ? '#0870C2' : '#1a2744' }}
                transition="background 0.15s"
                loading={loading}
                loadingText="Creating account…"
                mt={1}
              >
                {isCleaner ? 'Join as a cleaner' : 'Create my free account'}
                <Icon as={LucideArrowRight} w={3.5} h={3.5} ml={1.5} />
              </Button>

            </VStack>
          </form>

          <Box mt={7} pt={6} borderTop="1px solid #E3E8EE">
            <Text fontSize="13px" color="#425466" fontFamily="heading" textAlign="center">
              Already have an account?{' '}
              <NextLink href="/auth/login">
                <Text as="span" color="#0A80DB" fontWeight="700" cursor="pointer"
                  _hover={{ color: '#0870C2' }}>Sign in</Text>
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
