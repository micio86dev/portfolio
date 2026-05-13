/**
 * Request middleware.
 *
 * Two responsibilities:
 *
 * 1. Warms the i18n overlay from PocketBase (`translations` collection) before
 *    any page/component renders, so `useTranslations()` — which is
 *    synchronous and called deep in component frontmatter — sees the live
 *    copy. `loadTranslations` is internally cached (30s TTL) and falls back
 *    to the bundled JSON if PocketBase is unset/unreachable, so this stays
 *    cheap and never blocks the response on a slow backend for long.
 *
 * 2. Auto-locale: when someone lands on the bare root `/`, redirect to their
 *    preferred locale's homepage. Preference resolution order:
 *      a. `miciodev-locale` cookie (set whenever the visitor lands on any
 *         localised path, so their last choice is remembered);
 *      b. `Accept-Language` header (matched against our supported locales);
 *      c. fall through to the default locale (`en`), which means the page
 *         renders right here at `/` — no redirect.
 *    Only `/` triggers the redirect; every other path is treated as an
 *    explicit user choice and rendered as requested.
 */

import { defineMiddleware } from 'astro:middleware';
import { loadTranslations } from './lib/pocketbase';
import { getLangFromUrl, isLocale, DEFAULT_LOCALE, type Locale } from './i18n/utils';

const LOCALE_COOKIE = 'miciodev-locale';
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Best supported locale extracted from an `Accept-Language` header, if any.
 *  Walks the q-ordered list as given by the browser (already preference-sorted
 *  in practice) and returns the first 2-letter subtag we recognise. */
function pickLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  for (const item of header.split(',')) {
    const tag = item.trim().split(';')[0].split('-')[0].toLowerCase();
    if (isLocale(tag)) return tag;
  }
  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    await loadTranslations();
  } catch {
    /* never let i18n warm-up break the request — fall back to bundled JSON */
  }

  // (2) Auto-locale redirect — only on the bare root.
  if (context.url.pathname === '/') {
    const fromCookie = context.cookies.get(LOCALE_COOKIE)?.value;
    const preferred =
      (fromCookie && isLocale(fromCookie) ? fromCookie : null) ??
      pickLocaleFromAcceptLanguage(context.request.headers.get('accept-language')) ??
      DEFAULT_LOCALE;
    if (preferred !== DEFAULT_LOCALE) {
      return context.redirect(`/${preferred}/`, 302);
    }
  }

  // Remember the visitor's effective locale for next time. Only write when it
  // actually changes, so we don't burn a `Set-Cookie` on every request.
  const currentLocale = getLangFromUrl(context.url);
  if (context.cookies.get(LOCALE_COOKIE)?.value !== currentLocale) {
    context.cookies.set(LOCALE_COOKIE, currentLocale, {
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }

  return next();
});
