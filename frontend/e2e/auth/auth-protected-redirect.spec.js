import { test, expect } from '../helpers/test.js';
import { AUTH_PROTECTED_REDIRECT } from '../helpers/flow-tags.js';

/**
 * E2E tests for the protected-route guard.
 *
 * A logged-out user has no UI link to a protected route, so the guard can only
 * be exercised by navigating there directly. The redirect itself IS the
 * behavior under test, and it is asserted by the resulting URL — hence the
 * allow-no-interaction markers.
 */

test.describe('Auth — protected route redirect', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('redirects to sign_in when accessing dashboard without a session', {
    tag: [...AUTH_PROTECTED_REDIRECT, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (no UI path to /dashboard when logged out; the guard redirect on direct navigation is the behavior)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign_in/);
  });

  test('redirects to sign_in when accessing backoffice without a session', {
    tag: [...AUTH_PROTECTED_REDIRECT, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (no UI path to /backoffice when logged out; the guard redirect on direct navigation is the behavior)
    await page.goto('/backoffice');
    await expect(page).toHaveURL(/\/sign_in/);
  });
});
