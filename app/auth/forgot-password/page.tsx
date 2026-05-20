'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight, LucideMail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router              = useRouter();
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: 'Code sent!', description: data.message, type: 'success' });
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toaster.create({ title: 'Error', description: data.error, type: 'error' });
      }
    } finally {
      setLoading(false);
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

          <Box mb={7}>
            <Text fontSize="22px" fontWeight="800" color="#0B1120" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Forgot your password?
            </Text>
            <Text fontSize="14px" color="#64748B" fontFamily="heading">
              Enter your email and we&apos;ll send you a reset code.
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#64748B" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>Email</Text>
                <HStack gap={2}>
                  <Icon as={LucideMail} w="14px" h="14px" color="#94A3B8" flexShrink={0} />
                  <Input
                    type="email"
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
                    required
                  />
                </HStack>
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
                loadingText="Sending…"
              >
                Send reset code
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

            </VStack>
          </form>
        </Box>

        <Box mt={6} textAlign="center">
          <Text fontSize="13px" color="#64748B" fontFamily="heading">
            Remembered your password?{' '}
            <NextLink href="/auth/login">
              <Text as="span" color="#1A7FA0" fontWeight="700" cursor="pointer"
                _hover={{ color: '#15698A' }}>Back to sign in</Text>
            </NextLink>
          </Text>
        </Box>

      </Box>
    </Box>
  );
}
