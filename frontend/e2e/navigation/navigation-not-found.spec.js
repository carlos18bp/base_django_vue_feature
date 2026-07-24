import { test, expect } from '../helpers/test.js';
import { NOT_FOUND_PAGE } from '../helpers/flow-tags.js';

/**
 * E2E test for the 404 page.
 *
 * There is no UI path to a non-existent route, so the page is reached by direct
 * navigation — that navigation IS the behavior. The assertion is on the page's
 * own content (the "404" heading and the "Page not found." copy), not merely
 * that some element is visible.
 */

test.describe('Navigation — 404 page', () => {
  test('an unknown route renders the not-found page', {
    tag: [...NOT_FOUND_PAGE, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (no UI path to an unknown route; direct navigation is the only way to reach the 404 page)
    await page.goto('/this-route-does-not-exist-xyz');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
