import { test, expect } from '../helpers/test.js';
import { SHOPPING_CART_ADD, SHOPPING_CART_PERSIST, SHOPPING_CART_REMOVE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the shopping cart flow.
 *
 * Covers adding products to cart, cart persistence across pages, and
 * removing a product from the cart overlay.
 */

test.describe('Shopping — cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    // Guarded so this only clears ONCE per test, on the very first
    // navigation. addInitScript re-runs on EVERY navigation in the page —
    // an unguarded localStorage.clear() would wipe the cart right before
    // the "navigate back and check it's still there" step in the
    // persistence/removal specs below reads it back (same idiom already
    // used in auth-login.spec.js).
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('e2e-storage-cleared')) {
        localStorage.clear();
        sessionStorage.setItem('e2e-storage-cleared', 'true');
      }
    });
  });

  test('can add product to cart', {
    tag: [...SHOPPING_CART_ADD, '@role:shared', '@outcome:success'],
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
    tag: [...SHOPPING_CART_PERSIST, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // Bug this catches: cart state failing to survive a page navigation
    // (e.g. the Pinia store not persisting to localStorage, or not
    // rehydrating on load) — asserted by reopening the cart overlay and
    // finding the same item, not by a URL fallback that passes either way.
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

    await page.locator('[data-testid="header-cart"]').click();

    await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();
    // Playwright's getByText with an ANCHORED regex (/^Qty 1$/) tests the
    // pattern against the raw, un-trimmed text node — CartProduct.vue's
    // compiled markup has a leading space (" Qty 1"), so ^ never matches.
    // The exact-string form normalizes (trims) before comparing, so it does.
    await expect(page.getByText('Qty 1', { exact: true })).toBeVisible();
  });

  test('removing the only item in the cart shows the empty-cart state again', {
    tag: [...SHOPPING_CART_REMOVE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    // Bug this catches: a wiring break between CartProduct.vue's `removeProduct`
    // emit and ShoppingCart.vue's id-lookup-then-remove chain reaching the DOM.
    // removeProductFromCart's own logic is already unit-tested at the store and
    // component level (frontend/test/stores/product.test.js,
    // frontend/test/components/ShoppingCart.test.js) — this is the only test
    // that proves a real click in a real render actually updates the screen.
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

    // Detail.vue's addToCart() shows a blocking Swal.fire() confirmation
    // (no `toast: true`, so it has a backdrop and a confirm button) —
    // dismiss it before the next click, or it intercepts every subsequent
    // pointer event on the page.
    await page.getByRole('button', { name: 'OK', exact: true }).click();

    await page.locator('[data-testid="header-cart"]').click();
    // [data-testid="cart-overlay"] is the backdrop — a SIBLING of the panel
    // that actually holds the cart items/Remove link, not their ancestor, so
    // the "Remove" lookup below is intentionally page-scoped, not chained
    // off this locator.
    await expect(page.locator('[data-testid="cart-overlay"]')).toBeVisible();
    await expect(page.getByText('Qty 1', { exact: true })).toBeVisible();

    await page.getByText('Remove', { exact: true }).click();

    await expect(page.getByText('Qty 1', { exact: true })).toHaveCount(0);
    await expect(page.getByText('No products')).toBeVisible();
  });
});
