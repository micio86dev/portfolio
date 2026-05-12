import { test, expect } from './fixtures';

const LOCALES = [
  { path: '/', lang: 'en' },
  { path: '/it/', lang: 'it' },
  { path: '/es/', lang: 'es' },
] as const;

test.describe('home page', () => {
  for (const { path, lang } of LOCALES) {
    test(`renders at ${path} with <html lang="${lang}">`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      // The brand mark + main nav are present on every locale.
      await expect(page.locator('nav[aria-label]')).toBeVisible();
      await expect(page).toHaveTitle(/MicioDev/);
      await expect(page.locator('main#main')).toBeVisible();
    });
  }
});

test.describe('hreflang alternates', () => {
  for (const { path } of LOCALES) {
    test(`are complete and consistent on ${path}`, async ({ page }) => {
      await page.goto(path);

      const hrefFor = async (hreflang: string) =>
        page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`).getAttribute('href');

      const en = await hrefFor('en');
      const it = await hrefFor('it');
      const es = await hrefFor('es');
      const xDefault = await hrefFor('x-default');

      for (const v of [en, it, es, xDefault]) expect(v, 'every hreflang link has an href').toBeTruthy();

      // All four point at the same origin…
      const origin = new URL(en!).origin;
      expect(new URL(it!).origin).toBe(origin);
      expect(new URL(es!).origin).toBe(origin);
      expect(new URL(xDefault!).origin).toBe(origin);

      // …with the expected path shape (default locale unprefixed).
      expect(new URL(en!).pathname).toBe('/');
      expect(new URL(it!).pathname).toBe('/it/');
      expect(new URL(es!).pathname).toBe('/es/');
      // x-default mirrors the default locale.
      expect(xDefault).toBe(en);

      // Exactly one link per hreflang value (no duplicates).
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    });
  }
});
