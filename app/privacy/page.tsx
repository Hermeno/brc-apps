import type { Metadata } from 'next';
import PublicPage from '@/components/site/public-page';
import LegalDocument from '@/components/site/legal-document';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <PublicPage><LegalDocument kind="privacy" /></PublicPage>;
}
