import { test, expect } from './fixtures';

test.describe('/projects/[slug]', () => {
  test('renders a seeded project record', async ({ page }) => {
    const res = await page.goto('/projects/devboards-io');
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/DevBoards\.io/);
    await expect(page.locator('h1.pdetail__title')).toHaveText(/DevBoards\.io/);
    // Body copy from the seed record is rendered.
    await expect(page.locator('main#main')).toContainText('job-discovery');
  });

  test('localized route serves the same seeded project', async ({ page }) => {
    const res = await page.goto('/it/projects/devboards-io');
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
    await expect(page.locator('h1.pdetail__title')).toHaveText(/DevBoards\.io/);
  });

  test('returns 404 for an unknown slug', async ({ page }) => {
    const res = await page.goto('/projects/this-slug-does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
