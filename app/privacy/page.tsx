import type { Metadata } from 'next';
import PublicPage from '@/components/site/public-page';
import { cookies } from 'next/headers';
import LegalDocument from '@/components/site/legal-document';
import { LocaleProvider, type Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const locale = ((await cookies()).get('bc_locale')?.value ?? 'en') as Locale;
  return <PublicPage><LocaleProvider initialLocale={locale}><LegalDocument kind="privacy" /></LocaleProvider></PublicPage>;
}
