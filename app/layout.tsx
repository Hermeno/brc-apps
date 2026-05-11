import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'BrazilianClean — Limpeza Profissional',
  description: 'A plataforma número 1 para encontrar profissionais de limpeza verificados.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ backgroundColor: '#F9FAFB' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
