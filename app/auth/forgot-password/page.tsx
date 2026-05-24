'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight } from 'lucide-react';
import Image from 'next/image';

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
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center" px={5}>
      <Box w="full" maxW="340px">

        {/* Logo */}
        <HStack gap={2.5} mb={10} justify="center">
          <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="#0A2540" fontFamily="heading">
            Brazilian<Text as="span" color="#0A80DB">Clean</Text>
          </Text>
        </HStack>

        {/* Card */}
        <Box bg="white" border="1px solid #E3E8EE" p={8} style={{ borderRadius: 8 }}>

          <Box mb={7}>
            <Text fontSize="22px" fontWeight="800" color="#0A2540" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Forgot your password?
            </Text>
            <Text fontSize="14px" color="#425466" fontFamily="heading">
              Enter your email and we&apos;ll send you a reset code.
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" letterSpacing="-0.01em"
                  fontFamily="heading" mb={1.5}>Email</Text>
                <Input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  bg="white"
                  border="1.5px solid"
                  borderColor="#E3E8EE"
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
                bg="#0A80DB"
                color="white"
                h="40px"
                borderRadius="9999px"
                fontWeight="600"
                fontSize="13.5px"
                letterSpacing="-0.01em"
                fontFamily="heading"
                _hover={{ bg: '#0870C2' }}
                transition="background 0.15s"
                loading={loading}
                loadingText="Sending…"
              >
                Send reset code
                <Icon as={LucideArrowRight} w={3.5} h={3.5} ml={1.5} />
              </Button>

            </VStack>
          </form>
        </Box>

        <Box mt={6} textAlign="center">
          <Text fontSize="13px" color="#425466" fontFamily="heading">
            Remembered your password?{' '}
            <NextLink href="/auth/login">
              <Text as="span" color="#0A80DB" fontWeight="700" cursor="pointer"
                _hover={{ color: '#0870C2' }}>Back to sign in</Text>
            </NextLink>
          </Text>
        </Box>

      </Box>
    </Box>
  );
}
