'use client';

import { Box, Text, VStack, HStack, Input, Button, Icon } from '@chakra-ui/react';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight, LucideLock } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

function ResetPasswordForm() {
  const router   = useRouter();
  const params   = useSearchParams();
  const email    = params.get('email') ?? '';
  const t        = useT();

  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [codeError, setCodeError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toaster.create({ title: t('auth.reset.errorMismatch'), description: t('auth.reset.errorMismatchDesc'), type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodeError('');
        toaster.create({ title: t('auth.reset.successTitle'), description: t('auth.reset.successDesc'), type: 'success' });
        router.push('/auth/login');
      } else {
        setCodeError(data.error ?? t('auth.reset.resendCode'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center" px={5}>
      <Box w="full" maxW="400px">

        <HStack gap={2.5} mb={10} justify="space-between">
          <HStack gap={2.5}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="#0A2540" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>
          <LanguageSwitcher />
        </HStack>

        <Box bg="white" border="1px solid #E3E8EE" p={8} style={{ borderRadius: 8 }}>

          <Box mb={7}>
            <Text fontSize="22px" fontWeight="800" color="#0A2540" fontFamily="heading" letterSpacing="-0.025em" mb={1}>
              {t('auth.reset.title')}
            </Text>
            <Text fontSize="14px" color="#425466" fontFamily="heading">
              {t('auth.reset.subtitle')}
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5} textAlign="center">
                  {t('auth.reset.codeLabel')}
                </Text>
                <Input
                  placeholder={t('auth.reset.codePlaceholder')}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  textAlign="center"
                  fontSize="28px" fontWeight="800" letterSpacing="10px" fontFamily="heading"
                  bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" h="64px" borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                  maxLength={6}
                />
                {codeError ? (
                  <Box mt={2} p={3} bg="#FEF2F2" border="1px solid #FECACA" borderRadius="4px">
                    <Text fontSize="12px" color="#DC2626" fontFamily="heading" textAlign="center" mb={1.5}>
                      {codeError}
                    </Text>
                    <NextLink href="/auth/forgot-password">
                      <Text fontSize="12px" color="#0A80DB" fontWeight="700" textAlign="center"
                        cursor="pointer" fontFamily="heading" _hover={{ color: '#0870C2' }}>
                        {t('auth.reset.backToForgot')}
                      </Text>
                    </NextLink>
                  </Box>
                ) : null}
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>
                  {t('auth.reset.newPassword')}
                </Text>
                <HStack gap={2}>
                  <Icon as={LucideLock} w="14px" h="14px" color="#697386" flexShrink={0} />
                  <Input
                    type="password" placeholder={t('auth.reset.newPasswordPlaceholder')}
                    value={password} onChange={e => setPassword(e.target.value)}
                    bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" h="44px" borderRadius="4px"
                    fontFamily="heading" fontSize="14px"
                    _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                    required
                  />
                </HStack>
              </Box>

              <Box>
                <Text fontSize="11px" fontWeight="700" color="#425466" textTransform="uppercase"
                  letterSpacing="0.1em" fontFamily="heading" mb={1.5}>
                  {t('auth.reset.confirmPassword')}
                </Text>
                <HStack gap={2}>
                  <Icon as={LucideLock} w="14px" h="14px" color="#697386" flexShrink={0} />
                  <Input
                    type="password" placeholder={t('auth.reset.confirmPlaceholder')}
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" h="44px" borderRadius="4px"
                    fontFamily="heading" fontSize="14px"
                    _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                    required
                  />
                </HStack>
              </Box>

              <Button
                type="submit" bg="#0A80DB" color="white" h="44px" borderRadius="4px"
                fontWeight="700" fontSize="14px" fontFamily="heading"
                _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                loading={loading} loadingText={t('auth.reset.submitting')}
                disabled={code.length !== 6 || !password}
              >
                {t('auth.reset.submit')}
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

            </VStack>
          </form>
        </Box>

        <Box mt={6} textAlign="center">
          <NextLink href="/auth/forgot-password">
            <Text fontSize="13px" color="#0A80DB" fontWeight="600" cursor="pointer"
              fontFamily="heading" _hover={{ color: '#0870C2' }}>
              {t('auth.reset.resendCode')}
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
