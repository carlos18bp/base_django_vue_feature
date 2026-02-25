import { test, expect } from '../helpers/test.js';
import { AUTH_PROTECTED_REDIRECT } from '../helpers/flow-tags.js';

/**
 * E2E tests for protected route redirection.
 *
 * Covers unauthenticated user being redirected to sign_in
 * when accessing protected routes (dashboard, backoffice).
 */

test.describe('Auth — protected route redirect', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('redirects to sign_in when accessing dashboard without a session', {
    tag: [...AUTH_PROTECTED_REDIRECT, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign_in/);
  });

  test('redirects to sign_in when accessing backoffice without a session', {
    tag: [...AUTH_PROTECTED_REDIRECT, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/backoffice');
    await expect(page).toHaveURL(/\/sign_in/);
  });
});
