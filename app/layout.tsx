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
  title: 'BrazilianClean — Professional Cleaning Services',
  description: 'The #1 platform to find background-checked cleaners near you. Book in minutes, relax all day.',
  openGraph: {
    title: 'BrazilianClean — Professional Cleaning Services',
    description: 'Connect with vetted, background-checked cleaners in your area. Secure booking, satisfaction guaranteed.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
