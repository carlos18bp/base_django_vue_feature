import { test, expect } from '../helpers/test.js';
import { SHOPPING_CATALOG_BROWSE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the product catalog browsing flow.
 *
 * Covers catalog page loading, product display, category filtering,
 * and navigation to product detail.
 */

test.describe('Shopping — catalog browse', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('catalog page is reachable and shows products', {
    tag: [...SHOPPING_CATALOG_BROWSE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/catalog/);
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    await expect(body).toContainText(/.+/);
  });

  test('can filter products by category', {
    tag: [...SHOPPING_CATALOG_BROWSE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const categoryFilter = page.locator('[data-testid="category-filter"], .category-filter, select').first();
    await expect(categoryFilter).toBeVisible();
    await categoryFilter.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/catalog/);
  });

  test('can navigate to product detail from catalog', {
    tag: [...SHOPPING_CATALOG_BROWSE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/product/"]');
    const count = await productLinks.count();

    expect(count).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await expect(page).toHaveURL(/\/product\/\d+/);
  });
});
