import { defineConfig, devices } from '@playwright/test';

// E2E layer. Specs live in ./e2e and run against a production build served by
// `astro preview` (the @astrojs/node standalone server), backed by the bundled
// seed data (no PUBLIC_PB_URL → the PB client is null), so no test touches a
// real PocketBase or Resend. Using the built output rather than `astro dev`
// avoids Vite's dev-time dep-optimization races on freshly-installed deps. The
// contact-form spec additionally stubs the submission endpoint with page.route.
const PORT = Number(process.env.E2E_PORT ?? 4321);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // The contact form POSTs cross-origin to its PocketBase backend, which the
    // page CSP whitelists in production via PB_ORIGIN. With no PUBLIC_PB_URL in
    // the test env that origin isn't whitelisted, so we let the test browser
    // ignore CSP — the form's submit/validation logic is what these specs
    // exercise (and `page.route` then stubs the request). The CSP <meta> itself
    // is still emitted in the document and asserted separately if needed.
    bypassCSP: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `bun run build && bun run preview --port ${PORT}`,
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    // Force the seed-data path and a deterministic canonical origin.
    env: { PB_URL: '', SITE_URL: BASE_URL, PUBLIC_PB_URL: '' },
  },
});
