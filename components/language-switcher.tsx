'use client';

import { useLocale } from '@/lib/i18n';
import { Box, Text } from '@chakra-ui/react';

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <Box
      as="button"
      onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')}
      h="34px"
      px={2.5}
      borderRadius="lg"
      border="1px solid"
      borderColor={dark ? 'rgba(255,255,255,0.15)' : '#E3E8EE'}
      bg={dark ? 'rgba(255,255,255,0.06)' : 'transparent'}
      color={dark ? '#CBD5E1' : '#425466'}
      fontSize="11px"
      fontWeight="700"
      fontFamily="heading"
      letterSpacing="0.08em"
      cursor="pointer"
      transition="all 0.15s"
      display="flex"
      alignItems="center"
      gap={1}
      _hover={dark
        ? { bg: 'rgba(255,255,255,0.12)', color: 'white' }
        : { bg: '#F6F9FC', borderColor: '#CBD5E1', color: '#0A2540' }
      }
      title={locale === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <Text as="span" fontSize="12px">{locale === 'pt' ? '🇺🇸' : '🇧🇷'}</Text>
      <Text as="span">{t('lang.switch')}</Text>
    </Box>
  );
}
