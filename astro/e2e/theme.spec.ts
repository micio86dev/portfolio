import { test, expect } from './fixtures';

test.describe('theme toggle', () => {
  test('flips data-theme, persists to localStorage and survives a reload', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initial = await html.getAttribute('data-theme');
    expect(initial).toBe('light'); // jsdom-less browser, no saved pref → light

    // The desktop nav renders the first ThemeToggle; the drawer copy is hidden.
    const toggle = page.locator('.theme-toggle').first();
    await toggle.click();

    await expect(html).toHaveAttribute('data-theme', 'dark');
    const stored = await page.evaluate(() => window.localStorage.getItem('miciodev-theme'));
    expect(stored).toBe('dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // Reload — the inline bootstrap in <head> must re-apply the saved choice
    // before paint.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light and confirm it persists too.
    await page.locator('.theme-toggle').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => window.localStorage.getItem('miciodev-theme'))).toBe('light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
