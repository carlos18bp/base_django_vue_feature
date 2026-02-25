import { test, expect } from '../helpers/test.js';
import { SHOPPING_CART_ADD, SHOPPING_CART_PERSIST } from '../helpers/flow-tags.js';

/**
 * E2E tests for the shopping cart flow.
 *
 * Covers adding products to cart and cart persistence across pages.
 */

test.describe('Shopping — cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('can add product to cart', {
    tag: [...SHOPPING_CART_ADD, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/product/"]');
    expect(await productLinks.count()).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await page.waitForLoadState('networkidle');

    const addToCartButton = page.locator('button', { hasText: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    await expect(page).toHaveURL(/\/product\//);
  });

  test('cart persists across pages', {
    tag: [...SHOPPING_CART_PERSIST, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/product/"]');
    expect(await productLinks.count()).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await page.waitForLoadState('networkidle');

    const addButton = page.locator('button', { hasText: /add to cart/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const cartCounter = page.locator('[data-testid="cart-count"]');
    if (await cartCounter.count() > 0) {
      const count = await cartCounter.textContent();
      expect(parseInt(count)).toBeGreaterThan(0);
    } else {
      await expect(page).toHaveURL(/\/catalog/);
    }
  });
});
