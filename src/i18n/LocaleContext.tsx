import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { en } from './locales/en';
import { es } from './locales/es';
import { ru } from './locales/ru';
import { fr } from './locales/fr';
import { zh } from './locales/zh';
import type { Locale, LocaleMessages, MessageTree } from './types';

export type { Locale } from './types';
export { LOCALES } from './types';

const STORAGE_KEY = 'pulse_terminal_locale';

const MESSAGES: Record<Locale, LocaleMessages> = { en, ru, es, fr, zh };

function resolve(messages: MessageTree, path: string): string | undefined {
  let cur: string | MessageTree = messages;
  for (const part of path.split('.')) {
    if (typeof cur !== 'object' || cur === null || !(part in cur)) return undefined;
    cur = cur[part] as string | MessageTree;
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ru' || stored === 'es' || stored === 'en' || stored === 'fr' || stored === 'zh') return stored;
  const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  if (nav.startsWith('ru')) return 'ru';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('zh')) return 'zh';
  return 'en';
}

export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let text = resolve(MESSAGES[locale], key) ?? resolve(MESSAGES.en, key) ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale());

  const setLocale = useCallback((next: Locale) => {
    saveLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

/** Shorthand when only `t` is needed in a component. */
export function useT() {
  return useLocale().t;
}
