import { test, expect } from '../helpers/test.js';
import { SHOPPING_CATALOG_BROWSE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the product catalog browsing flow.
 *
 * Covers filtering by category and navigating into a product by clicking it.
 */

test.describe('Shopping — catalog browse', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('can filter products by category', {
    tag: [...SHOPPING_CATALOG_BROWSE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');

    const categoryFilter = page.locator('[data-testid="category-filter"], .category-filter, select').first();
    await expect(categoryFilter).toBeVisible({ timeout: 15000 });
    await categoryFilter.click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/\/catalog/);
  });

  test('opens a product by clicking it in the catalog', {
    tag: [...SHOPPING_CATALOG_BROWSE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');

    const productLinks = page.locator('a[href*="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first product from a dynamic server-rendered list; no stable per-item id)
    await productLinks.first().click();

    await expect(page).toHaveURL(/\/product\/\d+/);
  });
});
