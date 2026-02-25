import { test, expect } from '../helpers/test.js';
import { NOT_FOUND_PAGE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the 404 not found page flow.
 *
 * Covers accessing an unknown route and seeing the 404 page.
 */

test.describe('Navigation — 404 page', () => {
  test('accessing an unknown route renders the not-found page', {
    tag: [...NOT_FOUND_PAGE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toContainText('404');
  });
});
