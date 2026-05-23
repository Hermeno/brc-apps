'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Icon,
} from '@chakra-ui/react';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight, LucideLock } from 'lucide-react';
import Image from 'next/image';

function ResetPasswordForm() {
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

          <Box mb={7}>
            <Text fontSize="22px" fontWeight="800" color="#0A2540" fontFamily="heading"
              letterSpacing="-0.025em" mb={1}>
              Reset your password
            </Text>
            <Text fontSize="14px" color="#425466" fontFamily="heading">
              Enter the code sent to{' '}
              <Text as="span" fontWeight="700" color="#0A2540">{email}</Text>
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">

              {/* 6-digit code */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
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
                  bg="#F6F9FC"
                  border="1px solid"
                  borderColor="#E3E8EE"
                  h="64px"
                  borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                  maxLength={6}
                />
                <Text fontSize="12px" color="#697386" textAlign="center" mt={2} fontFamily="heading">
                  Code expires in 10 minutes
                </Text>
              </Box>

              {/* New password */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>New password</Text>
                <HStack gap={2}>
                  <Icon as={LucideLock} w="14px" h="14px" color="#697386" flexShrink={0} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    bg="#F6F9FC"
                    border="1px solid"
                    borderColor="#E3E8EE"
                    h="44px"
                    borderRadius="4px"
                    fontFamily="heading"
                    fontSize="14px"
                    _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                    required
                  />
                </HStack>
              </Box>

              {/* Confirm password */}
              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>Confirm new password</Text>
                <HStack gap={2}>
                  <Icon as={LucideLock} w="14px" h="14px" color="#697386" flexShrink={0} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    bg="#F6F9FC"
                    border="1px solid"
                    borderColor="#E3E8EE"
                    h="44px"
                    borderRadius="4px"
                    fontFamily="heading"
                    fontSize="14px"
                    _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                    required
                  />
                </HStack>
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
                loadingText="Saving…"
                disabled={code.length !== 6 || !password}
              >
                Reset password
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

            </VStack>
          </form>
        </Box>

        <Box mt={6} textAlign="center">
          <NextLink href="/auth/forgot-password">
            <Text fontSize="13px" color="#0A80DB" fontWeight="600" cursor="pointer"
              fontFamily="heading" _hover={{ color: '#0870C2' }}>
              ← Request a new code
            </Text>
          </NextLink>
        </Box>

      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
