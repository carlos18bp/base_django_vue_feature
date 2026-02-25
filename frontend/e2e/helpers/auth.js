/**
 * Auth helpers for E2E tests.
 *
 * Provides functions to set authentication state in localStorage
 * before navigation, and to perform login via the UI form.
 */

/**
 * Injects auth state into localStorage before any page navigation.
 * Must be called BEFORE page.goto().
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ accessToken?: string, refreshToken?: string, user?: object }} options
 */
export async function setAuthLocalStorage(page, { accessToken = 'e2e-token', refreshToken = 'e2e-refresh', user = { id: 1, email: 'test@example.com' } } = {}) {
  await page.addInitScript(
    ({ accessToken: at, refreshToken: rt, user: u }) => {
      localStorage.setItem('access_token', at);
      localStorage.setItem('refresh_token', rt);
      localStorage.setItem('user', JSON.stringify(u));
    },
    { accessToken, refreshToken, user },
  );
}

/**
 * Signs in via the UI form.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} password
 */
export async function login(page, email = 'admin@gmail.com', password = 'admin123') {
  await page.goto('/sign_in');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(password);
  await page.getByRole('button', { name: /(sign in|login|entrar)/i }).first().click();
  await page.waitForLoadState('networkidle');
}

/**
 * Signs out via the UI button if visible.
 *
 * @param {import('@playwright/test').Page} page
 */
export async function logout(page) {
  const signOutButton = page.getByRole('button', { name: /(sign out|logout|salir)/i }).first();
  if (await signOutButton.isVisible()) {
    await signOutButton.click();
    await page.waitForLoadState('networkidle');
  }
}
