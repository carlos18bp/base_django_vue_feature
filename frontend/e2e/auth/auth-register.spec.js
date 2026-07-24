import { test, expect } from '../helpers/test.js';
import { AUTH_REGISTER } from '../helpers/flow-tags.js';

/**
 * E2E tests for the sign-up flow.
 *
 * Covers a real registration that lands the user signed in (success), and the
 * client-side password-match validation (error). Both drive the form; neither
 * just checks that fields are visible.
 */

test.describe('Auth — sign-up', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/sign_up', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible({ timeout: 15000 });
  });

  test('registers a new account and lands signed in on the dashboard', {
    tag: [...AUTH_REGISTER, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    const uniqueEmail = `e2e_${Date.now()}@example.com`;

    await page.locator('[name="firstName"]').fill('E2E');
    await page.locator('[name="lastName"]').fill('Tester');
    await page.locator('[name="email"]').fill(uniqueEmail);
    await page.locator('[name="password"]').fill('Sup3rSecret!');
    await page.locator('[name="confirmPassword"]').fill('Sup3rSecret!');

    const signUpResponse = page.waitForResponse(
      (response) => response.url().includes('/sign_up/') && response.request().method() === 'POST',
      { timeout: 20000 },
    );
    await page.getByRole('button', { name: /(sign up|register|registrar|crear)/i }).first().click();
    const response = await signUpResponse;
    expect(response.ok()).toBe(true);

    // On success the app sets window.location.href = '/dashboard'.
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
  });

  test('rejects mismatched passwords with a validation message and stays on sign-up', {
    tag: [...AUTH_REGISTER, '@role:shared', '@outcome:error'],
  }, async ({ page }) => {
    await page.locator('[name="firstName"]').fill('E2E');
    await page.locator('[name="lastName"]').fill('Tester');
    await page.locator('[name="email"]').fill(`e2e_${Date.now()}@example.com`);
    await page.locator('[name="password"]').fill('Sup3rSecret!');
    await page.locator('[name="confirmPassword"]').fill('DoesNotMatch!');

    await page.getByRole('button', { name: /(sign up|register|registrar|crear)/i }).first().click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    await expect(page).toHaveURL(/\/sign_up/);
  });
});
