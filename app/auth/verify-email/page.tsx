'use client';

import {
  Box, Heading, Text, VStack, HStack, Input, Button, Container,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { motion } from 'motion/react';

export default function VerifyEmailPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const email        = params.get('email') ?? '';
  const [code, setCode]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toaster.create({ title: 'Please enter all 6 digits', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: 'Email verified!', description: 'You can now sign in.', type: 'success' });
        router.push('/auth/login');
      } else {
        toaster.create({ title: 'Error', description: data.error, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toaster.create({ title: 'New code sent!', type: 'success' });
      setCountdown(60);
    } finally {
      setResending(false);
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
                Verify your email
              </Heading>
              <Text color="slate.500" fontSize="sm">
                We sent a 6-digit code to<br />
                <Text as="span" fontWeight="bold" color="slate.700">{email}</Text>
              </Text>
            </VStack>

            <Box bg="white" p={8} borderRadius="3xl"
              boxShadow="0 4px 40px rgba(0,0,0,0.08)" border="1px solid" borderColor="slate.100">
              <form onSubmit={handleVerify}>
                <VStack gap={6} align="stretch">
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="slate.500"
                      textTransform="uppercase" mb={3} letterSpacing="wider" textAlign="center">
                      Verification code
                    </Text>
                    <Input placeholder="000000" value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      textAlign="center" fontSize="2xl" fontWeight="bold" letterSpacing="8px"
                      bg="slate.50" border="1px solid" borderColor="slate.200" h="16" borderRadius="xl"
                      _focus={{ bg: 'white', borderColor: 'brand.300', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' }}
                      maxLength={6} />
                    <Text fontSize="xs" color="slate.400" textAlign="center" mt={2}>
                      Code expires in 10 minutes
                    </Text>
                  </Box>

                  <Button type="submit" bg="brand.500" color="white" h="12" borderRadius="xl" fontWeight="bold"
                    _hover={{ bg: 'brand.600', transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}
                    transition="all 0.2s" loading={loading} loadingText="Verifying…"
                    disabled={code.length !== 6}>
                    Confirm email
                  </Button>

                  <Button variant="ghost" color="slate.500" h="10" borderRadius="xl" fontWeight="medium"
                    onClick={handleResend} loading={resending} disabled={countdown > 0}
                    _hover={{ color: 'brand.500', bg: 'brand.50' }}>
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                  </Button>
                </VStack>
              </form>
            </Box>

          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}
