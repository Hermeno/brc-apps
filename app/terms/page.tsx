import type { Metadata } from 'next';
import PublicPage from '@/components/site/public-page';
import LegalDocument from '@/components/site/legal-document';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <PublicPage><LegalDocument kind="terms" /></PublicPage>;
}
