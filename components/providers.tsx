'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@/lib/theme';
import { ReactNode } from 'react';
import { Toaster } from './ui/toaster';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider value={system}>
        {children}
        <Toaster />
      </ChakraProvider>
    </SessionProvider>
  );
}
