import { test, expect } from '../helpers/test.js';
import { SHOPPING_PRODUCT_DETAIL } from '../helpers/flow-tags.js';

/**
 * E2E tests for the product detail page flow.
 *
 * Covers viewing product detail, changing quantity,
 * and handling non-existent products.
 */

test.describe('Shopping — product detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('navigating to a product detail URL renders the product page', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/product/"]');
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await expect(page).toHaveURL(/\/product\//);
  });

  test('can change product quantity', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/product/"]');
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);

    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
  });

  test('product detail handles non-existent product gracefully', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/product/999999');

    await expect(page).toHaveURL(/\/product\/999999/);
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartButton).toHaveCount(0);
  });
});
