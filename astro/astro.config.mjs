// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// English is the default locale and is served at "/" (no prefix).
// Italian → /it/…, Spanish → /es/….
//
// Rendering: SSG + SSR hybrid. Pages opt into static generation with
// `export const prerender = true`; the contact endpoint
// (`src/pages/api/contact.ts`) uses `export const prerender = false` and is
// rendered on demand by the Node adapter (standalone mode). Swap the adapter
// for `@astrojs/vercel`, `@astrojs/cloudflare`, etc. when you pick a host.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://micio86dev.example',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
