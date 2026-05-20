'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Icon,
} from '@chakra-ui/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { LucideArrowRight, LucideRefreshCw } from 'lucide-react';

function VerifyEmailForm() {
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
    <Box minH="100vh" bg="#F8FAFC" display="flex" alignItems="center" justifyContent="center" px={5}>
      <Box w="full" maxW="400px">

        {/* Logo */}
        <HStack gap={2.5} mb={10} justify="center">
          <Box w="32px" h="32px" bg="#1A7FA0" style={{ borderRadius: 4 }}
            display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontWeight="800" fontSize="11px" letterSpacing="-0.02em" fontFamily="heading">BC</Text>
          </Box>
          <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="#0B1120" fontFamily="heading">
            Brazilian<Text as="span" color="#1A7FA0">Clean</Text>
          </Text>
        </HStack>

        {/* Card */}
        <Box bg="white" border="1px solid #E2E8F0" p={8}>

          <Box mb={7} textAlign="center">
            <Text fontSize="22px" fontWeight="800" color="#0B1120" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Verify your email
            </Text>
            <Text fontSize="14px" color="#64748B" fontFamily="heading">
              We sent a 6-digit code to
            </Text>
            <Text fontSize="14px" fontWeight="700" color="#0B1120" fontFamily="heading">
              {email}
            </Text>
          </Box>

          <form onSubmit={handleVerify}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5} textAlign="center">
                  Verification code
                </Text>
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  textAlign="center"
                  fontSize="28px"
                  fontWeight="800"
                  letterSpacing="10px"
                  fontFamily="heading"
                  bg="#F8FAFC"
                  border="1px solid"
                  borderColor="#E2E8F0"
                  h="64px"
                  borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: '#1A7FA0' }}
                  maxLength={6}
                />
                <Text fontSize="12px" color="#94A3B8" textAlign="center" mt={2} fontFamily="heading">
                  Code expires in 10 minutes
                </Text>
              </Box>

              <Button
                type="submit"
                bg="#1A7FA0"
                color="white"
                h="44px"
                borderRadius="4px"
                fontWeight="700"
                fontSize="14px"
                fontFamily="heading"
                _hover={{ bg: '#15698A' }}
                transition="background 0.15s"
                loading={loading}
                loadingText="Verifying…"
                disabled={code.length !== 6}
              >
                Confirm email
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

              <Button
                variant="ghost"
                color="#64748B"
                h="40px"
                borderRadius="4px"
                fontWeight="600"
                fontSize="13px"
                fontFamily="heading"
                onClick={handleResend}
                loading={resending}
                disabled={countdown > 0}
                _hover={{ color: '#1A7FA0', bg: '#F0F9FF' }}
              >
                <Icon as={LucideRefreshCw} w={3.5} h={3.5} mr={1.5} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
              </Button>

            </VStack>
          </form>
        </Box>

      </Box>
    </Box>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
