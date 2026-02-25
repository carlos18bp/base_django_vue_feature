import { test, expect } from './setup.js';

test.describe('Header interactions', () => {
  test('can open and close the search modal', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.locator('[data-testid="header-search"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    const overlay = page.locator('[data-testid="search-overlay"]');
    await expect(overlay).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search..."]');
    await searchInput.fill('can');
    await searchInput.fill('');

    await page.locator('[data-testid="search-close"]').click();
    await expect(overlay).toHaveCount(0);
  });

  test('can open and close the shopping cart', async ({ page }) => {
    await page.goto('/');

    const cartButton = page.locator('[data-testid="header-cart"]');
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    const cartOverlay = page.locator('[data-testid="cart-overlay"]');
    await expect(cartOverlay).toBeVisible();

    await page.locator('[data-testid="cart-close"]').click();
    await expect(cartOverlay).toHaveCount(0);
  });

  test('sign out clears authenticated header state', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'test-access');
      localStorage.setItem('refresh_token', 'test-refresh');
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com' }));
    });

    await page.goto('/');

    const signOutButton = page.locator('[data-testid="header-sign-out"]');
    await expect(signOutButton).toBeVisible();

    await signOutButton.click();
    await page.waitForTimeout(500);

    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(accessToken).toBeNull();

    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  });
});
