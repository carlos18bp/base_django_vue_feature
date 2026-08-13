import { test, expect } from '../helpers/test.js';
import { AUTH_REGISTER } from '../helpers/flow-tags.js';

/**
 * E2E tests for the sign-up flow.
 *
 * Covers a real registration that lands the user signed in (success), the
 * client-side password-match validation (error), and a server-side 500
 * (failure). All three drive the form; none just checks that fields are
 * visible.
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

  test('shows a failure notice and stays on sign-up when the server errors', {
    tag: [...AUTH_REGISTER, '@role:shared', '@outcome:failure'],
  }, async ({ page }) => {
    // Bug this catches: the catch-block message pipeline in SignUp.vue
    // (handleSignUp) breaking for the non-4xx-JSON path — e.g. no toast
    // rendered, or an incorrect navigation away from /sign_up — for any 5xx
    // or network failure, which does not carry the same response.data shape
    // the happy-path/validation-error tests above exercise.
    await page.route('**/sign_up/', (route) => route.fulfill({ status: 500 }));

    await page.locator('[name="firstName"]').fill('E2E');
    await page.locator('[name="lastName"]').fill('Tester');
    await page.locator('[name="email"]').fill(`e2e_${Date.now()}@example.com`);
    await page.locator('[name="password"]').fill('Sup3rSecret!');
    await page.locator('[name="confirmPassword"]').fill('Sup3rSecret!');

    await page.getByRole('button', { name: /(sign up|register|registrar|crear)/i }).first().click();

    // SignUp.vue's catch-block message chain (error?.response?.data?.error ||
    // ...detail || ...string body || error?.message || 'Error creating
    // account') falls through every branch for a bodyless 500 down to
    // axios's own error.message — verified live against this exact mock
    // (route.fulfill({status:500}) with no body): the toast's accessible
    // name is precisely "Request failed with status code 500", not the
    // generic fallback string. Pinning this (not just a negative) is what
    // proves the right branch of the chain actually ran.
    await expect(page.getByRole('alert', { name: /request failed with status code 500/i })).toBeVisible();
    await expect(page).toHaveURL(/\/sign_up/);
  });
});
