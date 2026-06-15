'use client';

import {
  Box, Text, VStack, HStack, Input, Button, Flex, Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toaster } from '@/lib/toaster';
import NextLink from 'next/link';
import { LucideArrowRight, LucideArrowLeft, LucideCheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/lib/i18n';
import LanguageSwitcher from '@/components/language-switcher';

function formatUSPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const t = useT();

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatUSPhone(e.target.value));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      toaster.create({ title: t('auth.register.errorPhone'), type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'CLEANER', phone: `+1${phoneDigits}` }),
      });
      if (res.ok) {
        toaster.create({ title: t('auth.register.successTitle'), description: t('auth.register.successDesc'), type: 'success' });
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        const data = await res.json();
        throw new Error(data.error || t('auth.register.errorFailed'));
      }
    } catch (error: any) {
      toaster.create({ title: t('common.error'), description: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    bg: 'white' as const,
    border: '1.5px solid',
    borderColor: '#E3E8EE',
    h: '38px',
    borderRadius: '8px',
    fontFamily: 'heading',
    fontSize: '13.5px',
    color: '#0A2540',
    px: 4,
    _placeholder: { color: '#B0BAC9' },
    _focus: { borderColor: '#0A80DB', boxShadow: 'none', outline: 'none' },
  };

  return (
    <Flex minH="100vh">

      {/* ── Left panel ── */}
      <Box
        display={{ base: 'none', lg: 'flex' }} flexDirection="column"
        w="480px" flexShrink={0} bg="#0B1120" position="relative" overflow="hidden"
      >
        <Box position="absolute" inset={0} style={{ backgroundImage: "url('/abc.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <Box position="absolute" inset={0} style={{ background: 'linear-gradient(180deg, rgba(11,17,32,0.88) 0%, rgba(11,17,32,0.60) 50%, rgba(11,17,32,0.88) 100%)' }} />

        <Flex direction="column" justify="space-between" h="full" position="relative" p={10}>
          <HStack gap={2.5}>
            <Image src="/2.png" alt="BrazilianClean" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <Text fontWeight="700" fontSize="15px" letterSpacing="-0.02em" color="white" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>

          <Box>
            <Text fontSize="10.5px" fontWeight="700" letterSpacing="0.14em" color="#0A80DB"
              textTransform="uppercase" fontFamily="heading" mb={4}
              style={{ borderLeft: '2px solid #0A80DB', paddingLeft: 10 }}>
              {t('auth.register.tagline')}
            </Text>
            <Text fontSize="26px" fontWeight="800" color="white" fontFamily="heading"
              letterSpacing="-0.03em" lineHeight="1.15" mb={6} whiteSpace="pre-line">
              {t('auth.register.hero')}
            </Text>
            <VStack align="stretch" gap={2.5}>
              {(['feature1', 'feature2', 'feature3'] as const).map(k => (
                <HStack key={k} gap={2}>
                  <Icon as={LucideCheckCircle} w="14px" h="14px" color="#0A80DB" flexShrink={0} />
                  <Text fontSize="13px" color="rgba(255,255,255,0.65)" fontFamily="heading">{t(`auth.register.${k}`)}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Flex>
      </Box>

      {/* ── Right panel ── */}
      <Flex flex={1} bg="white" alignItems="center" justifyContent="center" px={{ base: 5, md: 12 }} py={12}>
        <Box w="full" maxW="340px">

          <Flex justify="space-between" align="center" mb={6}>
            <NextLink href="/" style={{ textDecoration: 'none' }}>
              <HStack gap={1.5} display="inline-flex"
                _hover={{ color: '#0A80DB' }} color="#697386" transition="color 0.15s">
                <Icon as={LucideArrowLeft} w={3.5} h={3.5} />
                <Text fontSize="13px" fontFamily="heading" fontWeight="500">{t('common.backToHome')}</Text>
              </HStack>
            </NextLink>
            <LanguageSwitcher />
          </Flex>

          {/* Mobile logo */}
          <HStack gap={2.5} mb={10} display={{ base: 'flex', lg: 'none' }}>
            <Image src="/2.png" alt="BrazilianClean" width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <Text fontWeight="700" fontSize="14px" letterSpacing="-0.02em" color="#0A2540" fontFamily="heading">
              Brazilian<Text as="span" color="#0A80DB">Clean</Text>
            </Text>
          </HStack>

          <Box mb={8}>
            <Text fontSize="24px" fontWeight="800" color="#0A2540" fontFamily="heading" letterSpacing="-0.025em" mb={1}>
              {t('auth.register.title')}
            </Text>
            <Text fontSize="13px" color="#425466" fontFamily="heading">
              {t('auth.register.subtitle')}
            </Text>
          </Box>

          <form onSubmit={handleRegister}>
            <VStack gap={4} align="stretch">

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" fontFamily="heading" mb={1.5}>
                  {t('auth.register.fullName')}
                </Text>
                <Input {...inputStyle} placeholder={t('auth.register.fullNamePlaceholder')}
                  value={name} onChange={e => setName(e.target.value)} required />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" fontFamily="heading" mb={1.5}>
                  {t('auth.register.email')}
                </Text>
                <Input {...inputStyle} type="email" placeholder={t('auth.register.emailPlaceholder')}
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" fontFamily="heading" mb={1.5}>
                  {t('auth.register.phone')}
                </Text>
                <Input {...inputStyle} type="tel" placeholder={t('auth.register.phonePlaceholder')}
                  value={phone} onChange={handlePhone} required />
              </Box>

              <Box>
                <Text fontSize="12px" fontWeight="500" color="#425466" fontFamily="heading" mb={1.5}>
                  {t('auth.register.password')}
                </Text>
                <Input {...inputStyle} type="password" placeholder={t('auth.register.passwordPlaceholder')}
                  value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
              </Box>

              <Button
                type="submit" bg="#0A80DB" color="white" h="40px" borderRadius="9999px"
                fontWeight="600" fontSize="13.5px" letterSpacing="-0.01em" fontFamily="heading"
                _hover={{ bg: '#0870C2' }} transition="background 0.15s"
                loading={loading} loadingText={t('auth.register.submitting')} mt={1}
              >
                {t('auth.register.submit')}
                <Icon as={LucideArrowRight} w={3.5} h={3.5} ml={1.5} />
              </Button>

            </VStack>
          </form>

          <Box mt={7} pt={6} borderTop="1px solid #E3E8EE">
            <Text fontSize="13px" color="#425466" fontFamily="heading" textAlign="center">
              {t('auth.register.hasAccount')}{' '}
              <NextLink href="/auth/login">
                <Text as="span" color="#0A80DB" fontWeight="700" cursor="pointer" _hover={{ color: '#0870C2' }}>
                  {t('auth.register.signIn')}
                </Text>
              </NextLink>
            </Text>
          </Box>

        </Box>
      </Flex>
    </Flex>
  );
}
