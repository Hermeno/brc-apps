'use client';

import { Box, Text, VStack, HStack, Input, Button, Icon } from '@chakra-ui/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import { LucideArrowRight, LucideRefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

function VerifyEmailForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const email        = params.get('email') ?? '';
  const t            = useT();
  const [code, setCode]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toaster.create({ title: t('auth.verify.incompleteTitle'), description: t('auth.verify.incompleteDesc'), type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/verify-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: t('auth.verify.successTitle'), description: t('auth.verify.successDesc'), type: 'success' });
        router.push('/auth/login');
      } else {
        toaster.create({ title: t('auth.verify.errorTitle'), description: data.error ?? t('auth.verify.errorDesc'), type: 'error' });
        setCode('');
      }
    } catch {
      toaster.create({ title: t('auth.verify.networkError'), description: t('auth.verify.networkDesc'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res  = await fetch('/api/auth/resend-verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: t('auth.verify.newCodeTitle'), description: t('auth.verify.newCodeDesc'), type: 'success' });
        setCountdown(60);
        setCode('');
      } else {
        toaster.create({ title: t('auth.verify.sendError'), description: data.error ?? t('auth.verify.sendErrorDesc'), type: 'error' });
      }
    } catch {
      toaster.create({ title: t('auth.verify.networkError'), description: t('auth.verify.networkDesc'), type: 'error' });
    } finally {
      setResending(false);
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

          <Box mb={7} textAlign="center">
            <Text fontSize="22px" fontWeight="800" color="#0A2540" fontFamily="heading" letterSpacing="-0.025em" mb={1}>
              {t('auth.verify.title')}
            </Text>
            <Text fontSize="14px" color="#425466" fontFamily="heading">
              {t('auth.verify.subtitle')}
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
                  {t('auth.verify.codeLabel')}
                </Text>
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  textAlign="center"
                  fontSize="28px" fontWeight="800" letterSpacing="10px" fontFamily="heading"
                  bg="#F6F9FC" border="1px solid" borderColor="#E3E8EE" h="64px" borderRadius="4px"
                  _focus={{ bg: 'white', borderColor: '#0A80DB' }}
                  maxLength={6} autoComplete="one-time-code"
                />
                <Text fontSize="12px" color="#697386" textAlign="center" mt={2} fontFamily="heading">
                  {t('auth.verify.codeHint')}
                </Text>
              </Box>

              <Button
                type="submit" bg="#0A80DB" color="white" h="44px" borderRadius="4px"
                fontWeight="700" fontSize="14px" fontFamily="heading"
                _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                loading={loading} loadingText={t('auth.verify.submitting')}
                disabled={code.length !== 6 || loading}
              >
                {t('auth.verify.submit')}
                <Icon as={LucideArrowRight} w={4} h={4} ml={2} />
              </Button>

              <Button
                variant="ghost" color="#425466" h="40px" borderRadius="4px"
                fontWeight="600" fontSize="13px" fontFamily="heading"
                onClick={handleResend} loading={resending}
                disabled={countdown > 0 || resending}
                _hover={{ color: '#0A80DB', bg: '#F0F9FF' }} type="button"
              >
                <Icon as={LucideRefreshCw} w={3.5} h={3.5} mr={1.5} />
                {countdown > 0 ? t('auth.verify.resendCountdown', { n: countdown }) : t('auth.verify.resend')}
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
