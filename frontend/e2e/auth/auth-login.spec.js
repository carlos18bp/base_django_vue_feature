import { test, expect } from '../helpers/test.js';
import { AUTH_LOGIN_EMAIL, AUTH_LOGIN_INVALID } from '../helpers/flow-tags.js';

/**
 * E2E tests for the sign-in flow.
 *
 * Covers valid login, invalid credentials, and empty form submission.
 */

test.describe('Auth — sign-in page', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('e2e-storage-cleared')) {
        localStorage.clear();
        sessionStorage.setItem('e2e-storage-cleared', 'true');
      }
    });
    await page.goto('/sign_in', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[name="email"]')).toBeVisible({ timeout: 15000 });
  });

  test('can sign in with valid credentials', {
    tag: [...AUTH_LOGIN_EMAIL, '@role:shared'],
  }, async ({ page }) => {
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[type="password"]')).toBeVisible();

    await page.locator('input[type="email"]').fill('admin@gmail.com');
    await page.locator('input[type="password"]').fill('admin123');

    const signInResponse = page.waitForResponse((response) =>
      response.url().includes('/api/sign_in/') && response.status() === 200,
    );
    await page.getByRole('button', { name: /(sign in|login|entrar)/i }).first().click();
    await signInResponse;

    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 20000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('validates empty form submission stays on sign-in', {
    tag: [...AUTH_LOGIN_EMAIL, '@role:shared'],
  }, async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /(sign in|login|entrar)/i }).first();

    await expect(submitButton).toBeVisible();
    await submitButton.click();
    await expect(page).toHaveURL(/sign_in/);
  });

  test('shows error with invalid credentials', {
    tag: [...AUTH_LOGIN_INVALID, '@role:shared'],
  }, async ({ page }) => {
    await page.locator('[name="email"]').fill('nobody@example.com');
    await page.locator('[type="password"]').fill('wrongpass');
    const signInResponse = page.waitForResponse((response) =>
      response.url().includes('/api/sign_in/') && response.status() === 401,
    );
    await page.getByRole('button', { name: /(sign in|login|entrar)/i }).first().click();
    await signInResponse;

    await expect(page.getByRole('alert', { name: /invalid credentials/i })).toBeVisible();
    await expect(page).toHaveURL(/\/sign_in/);
  });
});
