'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Icon,
} from '@chakra-ui/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { LucideArrowRight, LucideRefreshCw } from 'lucide-react';
import Image from 'next/image';

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
      toaster.create({ title: 'Code incomplete', description: 'Please enter all 6 digits from your email.', type: 'error' });
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
        toaster.create({ title: 'Email verified!', description: 'Your account is active. You can sign in now.', type: 'success' });
        router.push('/auth/login');
      } else {
        toaster.create({ title: 'That code didn\'t work', description: data.error, type: 'error' });
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
      toaster.create({ title: 'New code sent!', description: 'Check your inbox — it may take a minute to arrive in your spam folder too.', type: 'success' });
      setCountdown(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center" px={5}>
      <Box w="full" maxW="400px">

        {/* Logo */}
        <HStack gap={2.5} mb={10} justify="center">
          <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="#0A2540" fontFamily="heading">
            Brazilian<Text as="span" color="#0A80DB">Clean</Text>
          </Text>
        </HStack>

        {/* Card */}
        <Box bg="white" border="1px solid #E3E8EE" p={8} style={{ borderRadius: 8 }}>

          <Box mb={7} textAlign="center">
            <Text fontSize="22px" fontWeight="800" color="#0A2540" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Check your inbox
            </Text>
            <Text fontSize="14px" color="#425466" fontFamily="heading">
              We sent a 6-digit verification code to
            </Text>
            <Text fontSize="14px" fontWeight="700" color="#0A2540" fontFamily="heading">
              {email}
            </Text>
          </Box>

          <form onSubmit={handleVerify}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5} textAlign="center">
                  Enter your code
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
                  bg="#F6F9FC"
                  border="1px solid"
                  borderColor="#E3E8EE"
                  h="64px"
                  borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                  maxLength={6}
                />
                <Text fontSize="12px" color="#697386" textAlign="center" mt={2} fontFamily="heading">
                  This code is valid for 10 minutes. Check your spam folder if you don't see it.
                </Text>
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
                loadingText="Verifying your code..."
                disabled={code.length !== 6}
              >
                Verify my email
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

              <Button
                variant="ghost"
                color="#425466"
                h="40px"
                borderRadius="4px"
                fontWeight="600"
                fontSize="13px"
                fontFamily="heading"
                onClick={handleResend}
                loading={resending}
                disabled={countdown > 0}
                _hover={{ color: '#0A80DB', bg: '#F0F9FF' }}
              >
                <Icon as={LucideRefreshCw} w={3.5} h={3.5} mr={1.5} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Send a new code'}
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
