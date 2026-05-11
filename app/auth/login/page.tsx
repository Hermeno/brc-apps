'use client';

import {
  Box, Heading, Text, VStack, HStack, Input, Button, Container, Flex,
} from '@chakra-ui/react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { motion } from 'motion/react';

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
      } else {
        toaster.create({ title: 'Sign in failed', description: 'Invalid email or password', type: 'error' });
      }
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center"
      px={4} position="relative" overflow="hidden">
      <Box position="fixed" top="-120px" left="-120px" w="500px" h="500px"
        bg="brand.50" borderRadius="full" filter="blur(80px)" opacity={0.6} zIndex={0} />
      <Box position="fixed" bottom="-80px" right="-80px" w="400px" h="400px"
        bg="yellow.50" borderRadius="full" filter="blur(80px)" opacity={0.7} zIndex={0} />

      <Container maxW="md" position="relative" zIndex={1}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          <VStack gap={8} align="stretch">

            <VStack gap={3} textAlign="center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}>
                <HStack justify="center" gap={3}>
                  <Box w="44px" h="44px" bgGradient="to-br" gradientFrom="brand.500" gradientTo="brand.700"
                    borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                    boxShadow="0 6px 20px rgba(37,99,235,0.35)">
                    <Text color="white" fontWeight="black" fontSize="md">BC</Text>
                  </Box>
                  <Text fontWeight="black" fontSize="xl" letterSpacing="tight" color="slate.900">
                    Brazilian<Text as="span" color="brand.500">Clean</Text>
                  </Text>
                </HStack>
              </motion.div>
              <Heading size="xl" fontWeight="black" letterSpacing="tight" color="slate.900">
                Welcome back
              </Heading>
              <Text color="slate.500">Sign in to your account to continue.</Text>
            </VStack>

            <Box bg="white" p={8} borderRadius="3xl"
              boxShadow="0 4px 40px rgba(0,0,0,0.08)" border="1px solid" borderColor="slate.100">
              <form onSubmit={handleLogin}>
                <VStack gap={5} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider">Email</Text>
                    <Input placeholder="name@email.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" />
                  </Box>

                  <Box>
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="xs" fontWeight="bold" color="slate.500"
                        textTransform="uppercase" letterSpacing="wider">Password</Text>
                      <NextLink href="/auth/forgot-password">
                        <Text fontSize="xs" color="brand.500" fontWeight="bold" cursor="pointer"
                          _hover={{ color: 'brand.600' }}>Forgot password?</Text>
                      </NextLink>
                    </Flex>
                    <Input type="password" placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" />
                  </Box>

                  <Button type="submit" bg="brand.500" color="white" h="12" borderRadius="xl" fontWeight="bold"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                    transition="all 0.2s" loading={loading} loadingText="Signing in…">
                    Sign in to BrazilianClean
                  </Button>
                </VStack>
              </form>
            </Box>

            <Text textAlign="center" fontSize="sm" color="slate.500">
              Don&apos;t have an account?{' '}
              <NextLink href="/auth/register">
                <Text as="span" color="brand.500" fontWeight="bold" cursor="pointer"
                  _hover={{ color: 'brand.600' }}>Create free account</Text>
              </NextLink>
            </Text>

          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
