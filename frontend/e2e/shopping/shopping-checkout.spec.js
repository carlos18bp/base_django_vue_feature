import { test, expect } from '../helpers/test.js';
import { SHOPPING_CHECKOUT_COMPLETE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the checkout flow.
 *
 * Covers completing checkout with items and validating required fields.
 */

test.describe('Shopping — checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test('can complete checkout with items in cart', {
    tag: [...SHOPPING_CHECKOUT_COMPLETE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/catalog');

    const productLinks = page.locator('a[href*="/product/"]');
    // quality: allow-fragile-selector (selecting first product link from dynamic server-rendered list; no stable per-item ID available)
    const firstProductLink = productLinks.first();
    await expect(firstProductLink).toBeVisible();
    expect(await productLinks.count()).toBeGreaterThan(0);
    const href = await firstProductLink.getAttribute('href');
    await page.goto(href);

    const addButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    await page.goto('/checkout');

    const payButton = page.getByRole('button', { name: /pay now/i });
    await expect(payButton).toBeVisible();

    await page.getByTestId('checkout-email').fill('test@example.com');
    await page.getByTestId('checkout-card-number').fill('4111111111111111');
    await page.getByTestId('checkout-expiry').fill('12/28');
    await page.getByTestId('checkout-cvc').fill('123');
    await page.getByTestId('checkout-address').fill('123 Main St');
    await page.getByTestId('checkout-city').fill('New York');
    await page.getByTestId('checkout-state').fill('NY');
    await page.getByTestId('checkout-postal-code').fill('10001');

    await payButton.click();

    await expect(page).not.toHaveURL(/\/checkout/, { timeout: 10000 });
  });

  test('validates required fields in checkout form', {
    tag: [...SHOPPING_CHECKOUT_COMPLETE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/checkout');

    const payButton = page.getByRole('button', { name: /(pay now|pay|checkout|finalizar)/i }).first();
    await expect(payButton).toBeVisible();
    await payButton.click();

    await expect(page).toHaveURL(/\/checkout/);
  });
});
