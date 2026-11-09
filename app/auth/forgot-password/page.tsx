'use client';

import { Box, Text, VStack, HStack, Input, Button, Icon } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

export default function ForgotPasswordPage() {
  const router              = useRouter();
  const t                   = useT();
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toaster.create({ title: t('auth.forgot.successTitle'), description: t('auth.forgot.successDesc'), type: 'success' });
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toaster.create({
          title: res.status === 404 ? t('auth.forgot.notFoundTitle') : t('auth.forgot.errorTitle'),
          description: data.error,
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center" px={5}>
      <Box w="full" maxW="340px">

        <HStack gap={2.5} mb={10} justify="space-between">
          <HStack gap={2.5}>
            <Image src="/images/brand/verliks-logo-600.png" alt="Verliks" width={149} height={32} style={{ objectFit: 'contain', flexShrink: 0 }} />
          </HStack>
          <LanguageSwitcher />
        </HStack>

        <Box bg="white" border="1px solid #DDE5E9" p={8} style={{ borderRadius: 2 }}>

          <Box mb={7}>
            <Text as="h1" fontSize="28px" fontWeight="300" color="#18314E" fontFamily="heading" letterSpacing="-0.01em" mb={1}>
              {t('auth.forgot.title')}
            </Text>
            <Text fontSize="14px" color="#455B70" fontFamily="heading">
              {t('auth.forgot.subtitle')}
            </Text>
          </Box>

          <form onSubmit={handleSubmit}>
            <VStack gap={5} align="stretch">

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#455B70" letterSpacing="-0.01em" fontFamily="heading" mb={1.5}>
                  {t('auth.forgot.email')}
                </Text>
                <Input
                  type="email" placeholder={t('auth.forgot.emailPlaceholder')}
                  value={email} onChange={e => setEmail(e.target.value)}
                  bg="white" border="1.5px solid" borderColor="#DDE5E9" h="38px" borderRadius="2px"
                  fontFamily="heading" fontSize="13.5px" color="#185FC6" px={4}
                  _placeholder={{ color: '#455B70' }} _focus={{ borderColor: '#185FC6', boxShadow: 'none', outline: 'none' }}
                  required
                />
              </Box>

              <Button
                type="submit" bg="#185FC6" color="white" h="40px" borderRadius="2px"
                fontWeight="600" fontSize="13.5px" letterSpacing="-0.01em" fontFamily="heading"
                _hover={{ bg: '#18314E' }} transition="background 0.15s"
                loading={loading} loadingText={t('auth.forgot.submitting')}
              >
                {t('auth.forgot.submit')}
                <Icon as={LucideArrowRight} w={3.5} h={3.5} ml={1.5} />
              </Button>

            </VStack>
          </form>
        </Box>

        <Box mt={6} textAlign="center">
          <Text fontSize="13px" color="#455B70" fontFamily="heading">
            {t('auth.forgot.rememberPassword')}{' '}
            <NextLink href="/auth/login">
              <Text as="span" color="#185FC6" fontWeight="700" cursor="pointer" _hover={{ color: '#18314E' }}>
                {t('auth.forgot.backToLogin')}
              </Text>
            </NextLink>
          </Text>
        </Box>

      </Box>
    </Box>
  );
}
