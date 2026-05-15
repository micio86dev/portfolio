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

/**
 * Resolve the `[...lang]` rest-route param to a `Locale` (or `null` if it
 * refers to an unknown segment). Pages collapse en/it/es into a single file
 * via this helper: `undefined` means the default-locale root (`/imprint`),
 * `'it'`/`'es'` means a prefixed path, and anything else is a 404 signal.
 */
export function resolveLangParam(raw: string | undefined): Locale | null {
  if (!raw) return DEFAULT_LOCALE;
  return isLocale(raw) ? raw : null;
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
 * Remote dictionary overlay — flat `key → { en, it, es }` map populated from the
 * PocketBase `translations` collection (see src/middleware.ts → loadTranslations
 * in lib/pocketbase.ts). It sits *on top of* the bundled JSON: a key present
 * here wins; anything missing falls through to the JSON, then the default
 * locale, then a visible `⟦key⟧` marker. Module-level on purpose — the data is
 * the same for every request, so it's safe to share and cheap to refresh.
 */
type RemoteEntry = Partial<Record<Locale, string>>;
let REMOTE: Record<string, RemoteEntry> = {};

/** Replace the remote dictionary overlay. Called by the PB loader; a no-op
 *  overlay (or an empty map) just means the bundled JSON is used as-is. */
export function applyRemoteDictionaries(map: Record<string, RemoteEntry>): void {
  REMOTE = map ?? {};
}

function remoteLookup(lang: Locale, key: string): string | undefined {
  const entry = REMOTE[key];
  if (!entry) return undefined;
  const v = entry[lang];
  if (typeof v === 'string' && v !== '') return v;
  const fallback = entry[DEFAULT_LOCALE];
  return typeof fallback === 'string' && fallback !== '' ? fallback : undefined;
}

/**
 * Returns a `t(key)` function for the given locale.
 * Resolution order: PocketBase overlay → bundled JSON (locale) → bundled JSON
 * (default locale) → a visible `⟦key⟧` marker, so missing translations are
 * obvious rather than blank.
 */
export function useTranslations(lang: Locale) {
  return function t(key: string): string {
    const value =
      remoteLookup(lang, key) ??
      lookup(DICTIONARIES[lang], key) ??
      lookup(DICTIONARIES[DEFAULT_LOCALE], key);
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
