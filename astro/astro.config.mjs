// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// English is the default locale and is served at "/" (no prefix).
// Italian → /it/…, Spanish → /es/….
//
// Rendering: SSR by default (`output: 'server'`), so pages re-read PocketBase
// on every request — content changes are live without a redeploy. The
// `@astrojs/node` standalone adapter outputs a self-contained Node server at
// `dist/server/entry.mjs` (it also serves the static client assets). Truly
// static pages (e.g. a future 404 or legal page) can opt out with
// `export const prerender = true`. Swap the adapter for `@astrojs/vercel`,
// `@astrojs/cloudflare`, etc. when you pick a different host.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://micio86dev.example',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
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
