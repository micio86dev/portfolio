/**
 * Request middleware.
 *
 * Warms the i18n overlay from PocketBase (`translations` collection) before any
 * page/component renders, so `useTranslations()` — which is synchronous and
 * called deep in component frontmatter — sees the live copy. `loadTranslations`
 * is internally cached (30s TTL) and falls back to the bundled JSON if
 * PocketBase is unset/unreachable, so this stays cheap and never blocks the
 * response on a slow backend for long.
 */

import { defineMiddleware } from 'astro:middleware';
import { loadTranslations } from './lib/pocketbase';

export const onRequest = defineMiddleware(async (_context, next) => {
  try {
    await loadTranslations();
  } catch {
    /* never let i18n warm-up break the request — fall back to bundled JSON */
  }
  return next();
});
