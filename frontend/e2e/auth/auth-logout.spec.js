import { test, expect } from '../helpers/test.js';
import { AUTH_LOGOUT } from '../helpers/flow-tags.js';
import { setAuthLocalStorage } from '../helpers/auth.js';

/**
 * E2E tests for the sign-out flow.
 *
 * Covers sign-out clearing session and localStorage state.
 */

test.describe('Auth — sign out', () => {
  test('sign out clears authenticated header state', {
    tag: [...AUTH_LOGOUT, '@role:shared'],
  }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await setAuthLocalStorage(page, {
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      user: { id: 1, email: 'test@example.com' },
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const signOutButton = page.locator('[data-testid="header-sign-out"]');
    await expect(signOutButton).toBeVisible();

    await signOutButton.click();
    await page.waitForLoadState('networkidle');

    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(accessToken).toBeNull();

    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  });
});
