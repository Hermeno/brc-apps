'use client';

import {
  Box, Heading, Text, VStack, HStack, Input, Button, Container,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { motion } from 'motion/react';

export default function ResetPasswordPage() {
  const router   = useRouter();
  const params   = useSearchParams();
  const email    = params.get('email') ?? '';

  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toaster.create({ title: 'Passwords do not match', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: 'Password reset!', description: 'Sign in with your new password.', type: 'success' });
        router.push('/auth/login');
      } else {
        toaster.create({ title: 'Error', description: data.error, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center"
      px={4} position="relative" overflow="hidden">
      <Box position="fixed" top="-100px" right="-100px" w="450px" h="450px"
        bg="brand.50" borderRadius="full" filter="blur(80px)" opacity={0.7} zIndex={0} />
      <Box position="fixed" bottom="-80px" left="-80px" w="400px" h="400px"
        bg="yellow.50" borderRadius="full" filter="blur(80px)" opacity={0.7} zIndex={0} />

      <Container maxW="md" position="relative" zIndex={1}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}>
          <VStack gap={8} align="stretch">

            <VStack gap={3} textAlign="center">
              <HStack justify="center" gap={3}>
                <Box w="44px" h="44px" bgGradient="to-br" gradientFrom="brand.500"
                  gradientTo="brand.700" borderRadius="xl"
                  display="flex" alignItems="center" justifyContent="center"
                  boxShadow="0 6px 20px rgba(37,99,235,0.35)">
                  <Text color="white" fontWeight="black" fontSize="md">BC</Text>
                </Box>
                <Text fontWeight="black" fontSize="xl" letterSpacing="tight" color="slate.900">
                  Brazilian<Text as="span" color="brand.500">Clean</Text>
                </Text>
              </HStack>
              <Heading size="xl" fontWeight="black" letterSpacing="tight" color="slate.900">
                Reset password
              </Heading>
              <Text color="slate.500" fontSize="sm">
                Enter the code sent to<br />
                <Text as="span" fontWeight="bold" color="slate.700">{email}</Text>
              </Text>
            </VStack>

            <Box bg="white" p={8} borderRadius="3xl"
              boxShadow="0 4px 40px rgba(0,0,0,0.08)" border="1px solid" borderColor="slate.100">
              <form onSubmit={handleSubmit}>
                <VStack gap={5} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider" textAlign="center">
                      Verification code
                    </Text>
                    <Input placeholder="000000" value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      textAlign="center" fontSize="2xl" fontWeight="bold" letterSpacing="8px"
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="16" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      maxLength={6} />
                    <Text fontSize="xs" color="slate.400" textAlign="center" mt={1}>
                      Code expires in 10 minutes
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider">New password</Text>
                    <Input type="password" placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" required />
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={2} letterSpacing="wider">Confirm new password</Text>
                    <Input type="password" placeholder="••••••••" value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="12" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      transition="all 0.2s" required />
                  </Box>

                  <Button type="submit" bg="brand.500" color="white" h="12" borderRadius="xl" fontWeight="bold"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                    transition="all 0.2s" loading={loading} loadingText="Saving…"
                    disabled={code.length !== 6 || !password}>
                    Reset password
                  </Button>
                </VStack>
              </form>
            </Box>

            <Text textAlign="center" fontSize="sm" color="slate.500">
              <NextLink href="/auth/forgot-password">
                <Text as="span" color="brand.500" fontWeight="bold" cursor="pointer"
                  _hover={{ color: 'brand.600' }}>Resend code</Text>
              </NextLink>
            </Text>

          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
