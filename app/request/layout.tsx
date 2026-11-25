import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Providers } from '@/components/providers';
import type { Locale } from '@/lib/i18n';

// /request is built with Chakra and the session, unlike the rest of the public site.
export default async function Layout({ children }: { children: ReactNode }) {
  const locale = ((await cookies()).get('bc_locale')?.value ?? 'en') as Locale;
  return <Providers locale={locale}>{children}</Providers>;
}
