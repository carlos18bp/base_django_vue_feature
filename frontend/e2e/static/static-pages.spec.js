import { test, expect } from '../helpers/test.js';
import { STATIC_ABOUT, STATIC_CONTACT } from '../helpers/flow-tags.js';

/**
 * E2E tests for static pages (About Us, Contact).
 *
 * Covers page load and content visibility.
 */

test.describe('Static — About Us', () => {
  test('about us page loads with content', {
    tag: [...STATIC_ABOUT, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/about_us');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/about_us/);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});

test.describe('Static — Contact', () => {
  test('contact page loads with content', {
    tag: [...STATIC_CONTACT, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/contact/);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
