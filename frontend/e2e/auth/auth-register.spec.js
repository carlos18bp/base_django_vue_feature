import { test, expect } from '../helpers/test.js';
import { AUTH_REGISTER } from '../helpers/flow-tags.js';

/**
 * E2E tests for the sign-up flow.
 *
 * Covers sign-up page accessibility and form display.
 */

test.describe('Auth — sign-up page', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/sign_up');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  });

  test('sign-up page is reachable and displays the registration form', {
    tag: [...AUTH_REGISTER, '@role:shared'],
  }, async ({ page }) => {
    await expect(page).toHaveURL(/\/sign_up/);
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[name="password"]')).toBeVisible();

    const submitButton = page.getByRole('button', { name: /(sign up|register|registrar|crear)/i }).first();
    await expect(submitButton).toBeVisible();
  });

  test('empty form submission stays on sign-up page', {
    tag: [...AUTH_REGISTER, '@role:shared'],
  }, async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /(sign up|register|registrar|crear)/i }).first();
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(page).toHaveURL(/\/sign_up/);
  });
});
