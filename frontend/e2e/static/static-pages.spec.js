import { test, expect } from '../helpers/test.js';
import { STATIC_ABOUT, STATIC_CONTACT } from '../helpers/flow-tags.js';

/**
 * E2E tests for the static pages (About Us, Contact).
 *
 * Each reaches the page by clicking its header link (not a deep link) and
 * asserts the page's own heading text — so the test fails if the nav link
 * breaks or the wrong page renders.
 */

test.describe('Static — About Us', () => {
  test('reaches About Us from the header and shows its heading', {
    tag: [...STATIC_ABOUT, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('link', { name: /about us/i }).first().click();

    await expect(page).toHaveURL(/\/about_us/);
    await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
  });
});

test.describe('Static — Contact', () => {
  test('reaches Contact from the header and shows its heading', {
    tag: [...STATIC_CONTACT, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('link', { name: /contact/i }).first().click();

    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  });
});
