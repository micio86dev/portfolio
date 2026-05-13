import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

// The Nav (and its nested ThemeToggle) hydrates with `client:idle`, so after a
// navigation the toggle isn't interactive until the island chunk has loaded and
// run. Wait for the network to settle — that's when the deferred island/Vue
// chunks have arrived and hydration has run — before clicking it.
async function clickThemeToggle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.locator('.theme-toggle').first().click();
}

test.describe('theme toggle', () => {
  test('flips data-theme, persists to localStorage and survives a reload', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    expect(await html.getAttribute('data-theme')).toBe('light'); // no saved pref → light

    await clickThemeToggle(page);
    await expect(html).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => window.localStorage.getItem('miciodev-theme'))).toBe('dark');
    await expect(page.locator('.theme-toggle').first()).toHaveAttribute('aria-pressed', 'true');

    // Reload — the inline bootstrap in <head> must re-apply the saved choice
    // before paint.
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light and confirm it persists too.
    await clickThemeToggle(page);
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => window.localStorage.getItem('miciodev-theme'))).toBe('light');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
