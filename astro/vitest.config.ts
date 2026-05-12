import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Only the code that the unit/component layers are responsible for. Astro
      // pages/components, the GSAP scroll composables and the request middleware
      // are covered by the Playwright E2E layer, not Vitest.
      include: ['src/lib/**/*.ts', 'src/i18n/**/*.ts', 'src/components/vue/**/*.vue'],
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
