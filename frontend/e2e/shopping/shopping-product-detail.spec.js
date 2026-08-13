import { test, expect } from '../helpers/test.js';
import { SHOPPING_PRODUCT_DETAIL } from '../helpers/flow-tags.js';

/**
 * E2E tests for the product detail page.
 *
 * The detail view renders its actions under `v-if="product"`, so the test waits
 * for the add-to-cart button (product loaded) before interacting, then exercises
 * the quantity control the flow is named for. The not-found case has no UI path
 * and asserts the absence of the product actions.
 */

test.describe('Shopping — product detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('opens a product and changes its quantity', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('domcontentloaded');

    const productLinks = page.locator('a[href*="/product/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first product from a dynamic server-rendered list; no stable per-item id)
    const href = await productLinks.first().getAttribute('href');
    await page.goto(href);
    await expect(page).toHaveURL(/\/product\/\d+/);

    // Actions render under v-if="product": wait for the product to load.
    await expect(page.getByTestId('add-to-cart')).toBeVisible({ timeout: 15000 });

    const quantity = page.getByTestId('quantity-value');
    await expect(quantity).toHaveText('1');
    await page.getByTestId('quantity-increment').click();
    await expect(quantity).toHaveText('2');
    await page.getByTestId('quantity-decrement').click();
    await expect(quantity).toHaveText('1');
  });

  test('a non-existent product shows no add-to-cart action', {
    tag: [...SHOPPING_PRODUCT_DETAIL, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (there is no UI path to a non-existent product; direct navigation is the only way to exercise the missing-product case)
    // quality: allow-deep-link (same reason: there is no product link that leads to a missing id, so a UI-driven entry point does not exist for this display case)
    await page.goto('/product/999999');
    await page.waitForLoadState('domcontentloaded');

    // Detail.vue's "Trending Products" heading sits outside the `v-if="product"` block
    // (Detail.vue:96-102), so it renders unconditionally regardless of whether the id
    // resolves. This anchors the absence check below to a page that actually rendered:
    // without it, a crashed app, a blank page, or the dev server's error overlay would
    // also satisfy `toHaveCount(0)` and pass.
    await expect(page.getByRole('heading', { name: 'Trending Products', level: 2 })).toHaveText('Trending Products');
    await expect(page.getByTestId('add-to-cart')).toHaveCount(0);
  });
});
