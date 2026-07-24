import { test, expect } from '../helpers/test.js';
import { AUTH_GUEST_REDIRECT } from '../helpers/flow-tags.js';

/**
 * E2E test for the guest-only route guard.
 *
 * An authenticated user hitting a guest-only route (sign_in) is sent to the
 * dashboard. There is no UI link back to sign_in once logged in, so the guard
 * is exercised by direct navigation — the redirect is the behavior, asserted by
 * the concrete landing URL (not merely "not sign_in").
 */

test.describe('Auth — guest redirect when already authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'user@example.com' }));
    });
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('an authenticated user visiting sign_in lands on the dashboard', {
    tag: [...AUTH_GUEST_REDIRECT, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (a logged-in user has no UI link to sign_in; the guest-guard redirect on direct navigation is the behavior)
    await page.goto('/sign_in');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
