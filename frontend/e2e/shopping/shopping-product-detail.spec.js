import { test, expect } from '../helpers/test.js';
import { SHOPPING_PRODUCT_DETAIL } from '../helpers/flow-tags.js';

/**
 * E2E tests for the product detail page.
 *
 * Reaches the detail page by clicking a product in the catalog (not a deep
 * link), and exercises the quantity control the flow is named for. The
 * not-found case has no UI path and is asserted by the absence of the product
 * actions.
 */

test.describe('Shopping — product detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('opens a product from the catalog and shows its actions', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');

    const productLinks = page.locator('a[href*="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first product from a dynamic server-rendered list; no stable per-item id)
    await productLinks.first().click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
  });

  test('can change the product quantity on the detail page', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');

    const productLinks = page.locator('a[href*="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first product from a dynamic server-rendered list; no stable per-item id)
    await productLinks.first().click();
    await expect(page).toHaveURL(/\/product\//);

    const quantity = page.getByTestId('quantity-value');
    await expect(quantity).toHaveText('1');

    await page.getByTestId('quantity-increment').click();
    await expect(quantity).toHaveText('2');

    await page.getByTestId('quantity-decrement').click();
    await expect(quantity).toHaveText('1');
  });

  test('a non-existent product shows no add-to-cart action', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared', '@outcome:error'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (there is no UI path to a non-existent product; direct navigation is the only way to exercise the missing-product case)
    await page.goto('/product/999999');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('add-to-cart')).toHaveCount(0);
  });
});
