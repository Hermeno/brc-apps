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
      borderRadius="2px"
      border="1px solid"
      borderColor={dark ? 'rgba(255, 255, 255, 0.15)' : '#DDE5E9'}
      bg={dark ? 'rgba(255, 255, 255, 0.06)' : 'transparent'}
      color={dark ? '#DDE5E9' : '#455B70'}
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
        ? { bg: 'rgba(255, 255, 255, 0.12)', color: 'white' }
        : { bg: '#F8F8F4', borderColor: '#DDE5E9', color: '#18314E' }
      }
      title={locale === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <Text as="span" fontSize="12px">{locale === 'pt' ? '🇺🇸' : '🇧🇷'}</Text>
      <Text as="span">{t('lang.switch')}</Text>
    </Box>
  );
}
