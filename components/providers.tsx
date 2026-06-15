'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/lib/theme';
import { ReactNode } from 'react';
import { Toaster } from './ui/toaster';
import { SessionProvider } from 'next-auth/react';
import { LocaleProvider, type Locale } from '@/lib/i18n';

export function Providers({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <SessionProvider>
      <LocaleProvider initialLocale={locale}>
        <ChakraProvider value={system}>
          {children}
          <Toaster />
        </ChakraProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
