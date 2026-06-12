import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Locale = 'es' | 'en';

import es from './locales/es.json';
import en from './locales/en.json';

const translations: Record<Locale, Record<string, string>> = {
  es,
  en,
};

const LocaleContext = createContext({ locale: 'es' as Locale, t: (k: string) => k, setLocale: (l: Locale) => {} });

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
      return (match && (match[1] as Locale)) || 'es';
    } catch (e) {
      return 'es';
    }
  });

  useEffect(() => {
    document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, [locale]);

  const t = useMemo(() => {
    return (key: string) => translations[locale][key] ?? key;
  }, [locale]);

  return <LocaleContext.Provider value={{ locale, t, setLocale }}>{children}</LocaleContext.Provider>;
};

export const useI18n = () => useContext(LocaleContext);

export default I18nProvider;
