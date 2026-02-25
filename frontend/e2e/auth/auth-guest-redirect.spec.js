import { test, expect } from '../helpers/test.js';
import { AUTH_GUEST_REDIRECT } from '../helpers/flow-tags.js';

/**
 * E2E tests for guest route redirection.
 *
 * Covers authenticated user being redirected away from guest-only routes.
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

  test('authenticated user navigating to sign_in is redirected away', {
    tag: [...AUTH_GUEST_REDIRECT, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/sign_in');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/sign_in/);
  });
});
