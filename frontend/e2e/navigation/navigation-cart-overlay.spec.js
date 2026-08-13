import { test, expect } from '../helpers/test.js';
import { HEADER_CART_OVERLAY } from '../helpers/flow-tags.js';

/**
 * E2E tests for the header cart overlay flow.
 *
 * Covers opening and closing the cart overlay from the header, and the
 * empty-cart display state.
 */

test.describe('Navigation — cart overlay', () => {
  test('can open and close the shopping cart', {
    tag: [...HEADER_CART_OVERLAY, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) test.skip(true, 'Desktop-only flow — cart button hidden on mobile (hidden lg:flex)');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartButton = page.locator('[data-testid="header-cart"]');
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    const cartOverlay = page.locator('[data-testid="cart-overlay"]');
    await expect(cartOverlay).toBeVisible();

    await page.mouse.click(200, 400);
    await expect(cartOverlay).toHaveCount(0, { timeout: 8000 });
  });

  test('renders the empty-cart message with no products in the cart', {
    tag: [...HEADER_CART_OVERLAY, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) test.skip(true, 'Desktop-only flow — cart button hidden on mobile (hidden lg:flex)');

    // Bug this catches: the v-else empty-cart branch in ShoppingCart.vue
    // regressing — e.g. always rendering the CartProduct list (even when
    // empty) instead of "No products" + Continue Shopping, or that link
    // losing its route to the catalog.
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cartButton = page.locator('[data-testid="header-cart"]');
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    await expect(page.getByText('No products')).toBeVisible();
    await expect(page.getByRole('link', { name: /continue shopping/i })).toBeVisible();
  });
});
