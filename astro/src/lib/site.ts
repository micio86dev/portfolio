/**
 * Single source of truth for small site-wide constants.
 *
 * `CONTACT_EMAIL` is the public contact address. Change it in one place:
 * the `PUBLIC_CONTACT_EMAIL` env var (or, failing that, the literal default
 * below). The `PUBLIC_` prefix matters — Astro inlines it into client bundles
 * so the Vue ContactForm island can read `import.meta.env.PUBLIC_CONTACT_EMAIL`
 * directly (with the same fallback).
 *
 * Resolved at RUNTIME, mirroring how `PB_URL` is handled in
 * `src/lib/pocketbase.ts`: `process.env.PUBLIC_CONTACT_EMAIL` first (set by the
 * container's `environment:` block in prod), then `import.meta.env` as a
 * fallback for `astro dev` reading a local `.env`. Server-only — this module
 * touches `process.env`, so don't import it from client components.
 */
export const CONTACT_EMAIL: string =
  (typeof process !== 'undefined' ? process.env.PUBLIC_CONTACT_EMAIL : undefined) ||
  (import.meta.env.PUBLIC_CONTACT_EMAIL as string | undefined) ||
  'micio86dev@gmail.com';
