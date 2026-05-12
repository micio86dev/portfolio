import { test, expect } from './fixtures';

const CONTACTS_ENDPOINT = '**/api/collections/contacts/records';

async function gotoContactForm(page: import('@playwright/test').Page) {
  await page.goto('/');
  // The form is `client:visible` — bring it into view so the island hydrates,
  // then wait for hydration: the char counter only reacts once Vue is live.
  await page.locator('#contact').scrollIntoViewIfNeeded();
  const msg = page.locator('#cf-message');
  await msg.waitFor({ state: 'visible' });
  await expect(async () => {
    await msg.fill('hydrating');
    await expect(page.locator('.cf__counter')).toHaveText('9 / 2000');
  }).toPass({ timeout: 15_000 });
  await msg.fill(''); // back to a pristine form for the validation specs
}

async function fillValid(page: import('@playwright/test').Page) {
  await page.locator('#cf-name').fill('Ada Lovelace');
  await page.locator('#cf-email').fill('ada@example.com');
  await page.locator('#cf-subject').fill('A project idea');
  await page.locator('#cf-message').fill('I would like to discuss a Laravel + Vue project with you.');
}

test.describe('contact form', () => {
  test('submits successfully against a mocked backend', async ({ page }) => {
    let received: Record<string, unknown> | undefined;
    await page.route(CONTACTS_ENDPOINT, async (route) => {
      received = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"rec1"}' });
    });

    await gotoContactForm(page);
    await fillValid(page);
    await page.locator('.cf__submit').click();

    const feedback = page.locator('.cf__feedback');
    await expect(feedback).toHaveClass(/is-success/);
    await expect(feedback).toHaveText(/sent/i);
    // The mocked endpoint got the typed fields and never the honeypot.
    expect(received).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'A project idea',
    });
    expect(received).not.toHaveProperty('website');
    // Form was reset.
    await expect(page.locator('#cf-name')).toHaveValue('');
  });

  test('rejects a bot-filled honeypot without sending anything', async ({ page }) => {
    let posted = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/collections/contacts/records')) posted = true;
    });

    await gotoContactForm(page);
    await fillValid(page);
    // The honeypot is visually hidden; set it the way a bot would and notify Vue.
    await page.locator('#cf-website').evaluate((el: HTMLInputElement) => {
      el.value = 'http://spam.example/';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('.cf__submit').click();

    // It *pretends* to succeed…
    await expect(page.locator('.cf__feedback')).toHaveClass(/is-success/);
    // …but nothing was transmitted.
    expect(posted).toBe(false);
  });

  test('shows validation errors and does not submit an empty form', async ({ page }) => {
    let posted = false;
    page.on('request', (req) => {
      if (req.url().includes('/api/collections/contacts/records')) posted = true;
    });

    await gotoContactForm(page);
    await page.locator('.cf__submit').click();

    await expect(page.locator('#cf-name-err')).not.toBeEmpty();
    await expect(page.locator('#cf-email-err')).not.toBeEmpty();
    await expect(page.locator('#cf-name')).toHaveAttribute('aria-invalid', 'true');
    expect(posted).toBe(false);
  });

  test('surfaces a generic error when the backend fails', async ({ page }) => {
    await page.route(CONTACTS_ENDPOINT, (route) => route.fulfill({ status: 500, body: 'boom' }));

    await gotoContactForm(page);
    await fillValid(page);
    await page.locator('.cf__submit').click();

    const feedback = page.locator('.cf__feedback');
    await expect(feedback).toHaveClass(/is-error/);
    // Generic copy with the contact email substituted — never PocketBase's body.
    await expect(feedback).toContainText('@');
    await expect(feedback).not.toContainText('boom');
  });
});
