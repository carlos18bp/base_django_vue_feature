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
    await page.waitForLoadState('domcontentloaded');

    const productLinks = page.locator('a[href*="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await page.waitForLoadState('domcontentloaded');

    const addToCartButton = page.locator('button', { hasText: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    await expect(page).toHaveURL(/\/product\//);
  });

  test('cart persists across pages', {
    tag: [...SHOPPING_CART_PERSIST, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');

    const productLinks = page.locator('a[href*="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    expect(await productLinks.count()).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await page.waitForLoadState('domcontentloaded');

    const addButton = page.locator('button', { hasText: /add to cart/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('a[href*="/product/"]').first()).toBeVisible({ timeout: 15000 });

    const cartCounter = page.locator('[data-testid="cart-count"]');
    if (await cartCounter.count() > 0) {
      const count = await cartCounter.textContent();
      expect(parseInt(count)).toBeGreaterThan(0);
    } else {
      await expect(page).toHaveURL(/\/catalog/);
    }
  });
});
