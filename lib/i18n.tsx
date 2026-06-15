'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { en } from '@/messages/en';
import { pt } from '@/messages/pt';

export type Locale = 'pt' | 'en';
const COOKIE = 'bc_locale';
const messages: Record<Locale, typeof en> = { en, pt };

function dig(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, k) => (acc && typeof acc === 'object' ? acc[k] : undefined), obj);
}

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleCtx = createContext<Ctx>({ locale: 'pt', setLocale: () => {}, t: k => k });

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    document.cookie = `${COOKIE}=${l};path=/;max-age=31536000;SameSite=Lax`;
    setLocaleState(l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let value = dig(messages[locale], key) ?? dig(messages.en, key) ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = (value as string).replace(`{{${k}}}`, String(v));
      });
    }
    return value as string;
  }, [locale]);

  return <LocaleCtx.Provider value={{ locale, setLocale, t }}>{children}</LocaleCtx.Provider>;
}

export const useT      = () => useContext(LocaleCtx).t;
export const useLocale = () => useContext(LocaleCtx);
