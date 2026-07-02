// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Vercel sets VERCEL=1 in every build/runtime env. On Vercel we use the Vercel
// serverless adapter; everywhere else (local Docker, the DO VPS during the
// migration) we keep the @astrojs/node standalone adapter — so both deploy
// targets build from this one config without a breaking cutover.
const onVercel = !!process.env.VERCEL;

// English is the default locale and is served at "/" (no prefix).
// Italian → /it/…, Spanish → /es/….
//
// Rendering: SSR by default (`output: 'server'`), so pages re-read PocketBase
// on every request — content changes are live without a redeploy. The
// `@astrojs/node` standalone adapter outputs a self-contained Node server at
// `dist/server/entry.mjs` (it also serves the static client assets). Truly
// static pages (e.g. a future 404 or legal page) can opt out with
// `export const prerender = true`. The adapter is chosen at build time from the
// environment (see `onVercel` above).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://micio86dev.example',
  output: 'server',
  // On Vercel, images must go through Vercel's native Image Optimization
  // (`/_vercel/image`) rather than Astro's `/_image` endpoint: `/_image`
  // re-fetches the source asset over HTTP using the request origin, and since
  // Astro's host-header hardening (see `security.allowedDomains` below) that
  // origin degrades to `https://localhost` inside the serverless function, so
  // every `/_image` request 404s. Native optimization has no self-fetch (and
  // no runtime sharp). `sizes` = every width our <Image>/getImage calls emit
  // (footer mark 36/72, nav logo 60, 404 logo 96, hero srcset 640–1672);
  // other widths get snapped to the nearest entry.
  adapter: onVercel
    ? vercel({
        imageService: true,
        imagesConfig: {
          sizes: [36, 60, 72, 96, 640, 960, 1280, 1672],
          formats: ['image/avif', 'image/webp'],
        },
      })
    : node({ mode: 'standalone' }),
  // Hosts trusted when Astro rebuilds `Astro.url` from `Host`/`X-Forwarded-Host`
  // (Astro ≥5.14 host-header hardening). A host not listed here silently
  // degrades `Astro.url` to `https://localhost`. Apex + subdomains (www,
  // stage) + Vercel preview URLs + local dev/preview.
  security: {
    allowedDomains: [
      { hostname: 'micio86dev.it' },
      { hostname: '*.micio86dev.it' },
      { hostname: '*.vercel.app' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },
  // Inline every stylesheet into the document instead of emitting render-blocking
  // <link rel="stylesheet"> requests — the per-page CSS here is small and SSR
  // serves a fresh document each request anyway, so cross-page CSS caching buys
  // little. Cuts the critical request chain (helps FCP/LCP).
  build: { inlineStylesheets: 'always' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  // The sitemap is served by a dynamic SSR endpoint (`src/pages/sitemap.xml.ts`)
  // rather than the `@astrojs/sitemap` integration, so it can enumerate the
  // PocketBase-backed `[slug]` routes at request time.
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
