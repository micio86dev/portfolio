import { test as base } from '@playwright/test';

/**
 * Shared test fixture: pre-acknowledge the cookie notice via an init script so
 * the fixed-position bar never overlaps interactive content during a run.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem(
          'miciodev-cookie-ack',
          JSON.stringify({ v: 1, ack: true, ts: Date.now() }),
        );
      } catch {
        /* ignore */
      }
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
