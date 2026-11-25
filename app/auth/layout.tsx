import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import AppScope from '@/components/app-scope';
import { Providers } from '@/components/providers';
import type { Locale } from '@/lib/i18n';

export default async function Layout({ children }: { children: ReactNode }) {
  const locale = ((await cookies()).get('bc_locale')?.value ?? 'en') as Locale;
  return <Providers locale={locale}><AppScope>{children}</AppScope></Providers>;
}
