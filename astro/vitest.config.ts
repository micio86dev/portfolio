import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

// Vitest config for the unit + component layers.
//   - bun run test:unit       → src/__tests__/unit/**
//   - bun run test:components  → src/__tests__/components/**
//   - bun run test:coverage    → both, with the V8 coverage gate (≥ 85%)
// The Vue plugin lets us mount `.vue` islands with @vue/test-utils. Tests run
// in jsdom; src/__tests__/setup.ts polyfills the browser bits jsdom lacks
// (matchMedia). No test touches the real PocketBase / Resend — the PB client is
// null unless a test stubs PUBLIC_PB_URL + the `pocketbase` module (see
// src/__tests__/unit/pocketbase.live.test.ts), and `fetch` is mocked in the
// component tests.
export default defineConfig({
  plugins: [vue()],
  // `astro:middleware` is a virtual module that only exists inside the Astro
  // build. Point it at a tiny test-only stub so src/middleware.ts can be
  // exercised by Vitest.
  resolve: {
    alias: {
      'astro:middleware': fileURLToPath(
        new URL('./src/__tests__/_stubs/astro-middleware.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // All JS/TS/Vue logic the unit + component layers are responsible for.
      // `.astro` pages and components stay out — v8 can't instrument them; the
      // Playwright E2E layer covers that surface separately.
      include: [
        'src/lib/**/*.ts',
        'src/i18n/**/*.ts',
        'src/components/vue/**/*.vue',
        'src/composables/**/*.ts',
        'src/scripts/**/*.ts',
        'src/middleware.ts',
      ],
      exclude: ['src/lib/seed-data.ts'], // static fixture data — no logic to exercise
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});
