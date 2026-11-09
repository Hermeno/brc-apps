import type { ReactNode } from 'react';
import AppScope from '@/components/app-scope';

export default function Layout({ children }: { children: ReactNode }) {
  return <AppScope>{children}</AppScope>;
}
