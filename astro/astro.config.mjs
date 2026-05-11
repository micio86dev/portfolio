// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
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
  integrations: [
    vue(),
    sitemap({
      // SSR `[slug]` routes aren't auto-discovered; list the new static-ish
      // pages explicitly so they make it into the sitemap.
      customPages: [
        '/projects',
        '/notes',
        '/privacy',
        '/imprint',
        '/it/projects',
        '/it/notes',
        '/it/privacy',
        '/it/imprint',
        '/es/projects',
        '/es/notes',
        '/es/privacy',
        '/es/imprint',
      ].map((p) => new URL(p, process.env.SITE_URL ?? 'https://micio86dev.example').toString()),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
