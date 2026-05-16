import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BrazilianClean — Limpeza Profissional',
  description: 'A plataforma número 1 para encontrar profissionais de limpeza verificados.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${inter.variable}`}
        suppressHydrationWarning
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
