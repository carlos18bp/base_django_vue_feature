import { test, expect } from '../helpers/test.js';
import { AUTH_LOGIN_EMAIL, AUTH_LOGIN_INVALID, AUTH_LOGIN_SERVER_ERROR } from '../helpers/flow-tags.js';

/**
 * E2E tests for the sign-in flow.
 *
 * Covers valid login, invalid credentials, and a server-side 500 (a failure
 * distinct from "invalid credentials" — SignIn.vue branches on response
 * status and only the 401 branch is exercised by the invalid-credentials
 * test above).
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
    tag: [...AUTH_LOGIN_EMAIL, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await expect(page.locator('[name="email"]')).toBeVisible();
    await expect(page.locator('[type="password"]')).toBeVisible();

    await page.locator('input[type="email"]').fill('admin@gmail.com');
    await page.locator('input[type="password"]').fill('password');

    const signInResponse = page.waitForResponse(
      (response) => response.url().includes('/api/sign_in/') && response.status() === 200,
      { timeout: 20000 },
    );
    await page.getByRole('button', { name: /(sign in|login|entrar)/i }).first().click();
    await signInResponse;

    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 20000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('shows error with invalid credentials', {
    tag: [...AUTH_LOGIN_INVALID, '@role:shared', '@outcome:error'],
  }, async ({ page }) => {
    await page.locator('[name="email"]').fill('nobody@example.com');
    await page.locator('[type="password"]').fill('wrongpass');
    const signInResponse = page.waitForResponse(
      (response) => response.url().includes('/api/sign_in/') && response.status() === 401,
      { timeout: 20000 },
    );
    await page.getByRole('button', { name: /(sign in|login|entrar)/i }).first().click();
    await signInResponse;

    await expect(page.getByRole('alert', { name: /invalid credentials/i })).toBeVisible();
    await expect(page).toHaveURL(/\/sign_in/);
  });

  test('shows a generic failure notice when the server errors', {
    tag: [...AUTH_LOGIN_SERVER_ERROR, '@role:shared', '@outcome:failure'],
  }, async ({ page }) => {
    // Bug this catches: the same unified catch-block regression as above, but
    // in SignIn.vue's own status-branching (handleSignIn) — a 5xx must fall
    // to the generic "Error signing in" else-branch, not the 401-only
    // "Invalid credentials" message, and must not throw unhandled or navigate
    // away.
    await page.route('**/sign_in/', (route) => route.fulfill({ status: 500 }));

    await page.locator('[name="email"]').fill('admin@gmail.com');
    await page.locator('[type="password"]').fill('password');
    await page.getByRole('button', { name: /(sign in|login|entrar)/i }).first().click();

    await expect(page.getByRole('alert', { name: /error signing in/i })).toBeVisible();
    await expect(page).toHaveURL(/\/sign_in/);
  });
});
