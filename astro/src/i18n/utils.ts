import en from './en.json';
import it from './it.json';
import es from './es.json';

export const LOCALES = ['en', 'it', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const DICTIONARIES: Record<Locale, Record<string, unknown>> = { en, it, es };

/** Human-readable labels for the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  it: 'IT',
  es: 'ES',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Read the active locale from a URL pathname ("/it/…" → "it", "/" → "en"). */
export function getLangFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split('/');
  return maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

/** Strip a leading locale segment from a pathname, returning the "neutral" path. */
export function stripLocale(pathname: string): string {
  const [, maybeLocale, ...rest] = pathname.split('/');
  if (maybeLocale && isLocale(maybeLocale) && maybeLocale !== DEFAULT_LOCALE) {
    return '/' + rest.join('/');
  }
  return pathname;
}

function lookup(dict: Record<string, unknown>, key: string): string | undefined {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict) as string | undefined;
}

/**
 * Returns a `t(key)` function for the given locale.
 * Falls back to the default locale, then to the key itself, so missing
 * translations are visible rather than blank.
 */
export function useTranslations(lang: Locale) {
  return function t(key: string): string {
    const value = lookup(DICTIONARIES[lang], key) ?? lookup(DICTIONARIES[DEFAULT_LOCALE], key);
    if (typeof value === 'string') return value;
    return `⟦${key}⟧`;
  };
}

/**
 * Returns a `path(p)` helper that prefixes the locale segment.
 * `useTranslatedPath('it')('/contact')` → `/it/contact`
 * `useTranslatedPath('en')('/contact')` → `/contact`   (default locale, no prefix)
 */
export function useTranslatedPath(lang: Locale) {
  return function path(p = '/'): string {
    const clean = p.startsWith('/') ? p : `/${p}`;
    if (lang === DEFAULT_LOCALE) return clean === '/' ? '/' : clean;
    return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
  };
}
