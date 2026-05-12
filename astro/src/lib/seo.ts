/**
 * Small SEO/URL helpers shared by the dynamic sitemap, robots.txt and the
 * JSON-LD on project pages.
 *
 * `PUBLIC_SITE_URL` is read at RUNTIME (`process.env` first, then
 * `import.meta.env`) the same way `PUBLIC_PB_URL` is in lib/pocketbase.ts.
 * `Astro.site` is already environment-correct (set from the `SITE_URL` build
 * arg in astro.config.mjs), so it's the next fallback; the request origin is
 * the last resort.
 */

import { LOCALES, type Locale } from '../i18n/utils';

export { LOCALES };
export type { Locale };

/** Resolve the canonical base origin (no trailing slash). */
export function siteUrl(astroSite: URL | undefined, requestUrl: string): string {
  const fromEnv =
    (typeof process !== 'undefined' ? process.env.PUBLIC_SITE_URL : undefined) ||
    (import.meta.env.PUBLIC_SITE_URL as string | undefined);
  const raw =
    fromEnv || (astroSite ? astroSite.toString() : undefined) || new URL(requestUrl).origin;
  return raw.replace(/\/+$/, '');
}

/** True for the staging deployment (`stage.…` hostname). */
export function isStagingHost(base: string): boolean {
  try {
    return new URL(base).hostname.startsWith('stage.');
  } catch {
    return false;
  }
}

/**
 * Prefix a locale segment onto a neutral path.
 *   en → path as-is ('/projects' → '/projects', '/' → '/')
 *   it/es → '/<locale><path>' ('/projects' → '/it/projects', '/' → '/it/')
 */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') return clean;
  return clean === '/' ? `/${locale}/` : `/${locale}${clean}`;
}

/** XML-escape a string for use in element text / attribute values. */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
