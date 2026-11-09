'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import '@/app/app.css';

/* Gives the client and cleaner screens (everything under /auth and /dashboard
   except admin) the public palette from app/app.css. The class also goes on
   <body> because Chakra renders menus, dialogs and toasts in portals there. */
export default function AppScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const on = !pathname.startsWith('/dashboard/admin') && pathname !== '/auth/setup-admin';
  useEffect(() => {
    document.body.classList.toggle('vapp', on);
    return () => document.body.classList.remove('vapp');
  }, [on]);
  return <div className={on ? 'vapp' : undefined}>{children}</div>;
}
