import { test, expect } from '../helpers/test.js';
import { HEADER_SEARCH } from '../helpers/flow-tags.js';

/**
 * E2E tests for the header search modal flow.
 *
 * Covers opening, using, and closing the search modal.
 */

test.describe('Navigation — search modal', () => {
  test('can open and close the search modal', {
    tag: [...HEADER_SEARCH, '@role:shared'],
  }, async ({ page }) => {
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) test.skip(true, 'Desktop-only flow — search button hidden on mobile (hidden lg:flex)');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const searchButton = page.locator('[data-testid="header-search"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    const overlay = page.locator('[data-testid="search-overlay"]');
    await expect(overlay).toBeVisible();

    const searchInput = page.locator('input[placeholder="Search..."]');
    await expect(searchInput).toBeVisible({ timeout: 3000 });
    await searchInput.fill('can');
    await searchInput.fill('');

    await page.mouse.click(640, 600);
    await expect(overlay).toHaveCount(0, { timeout: 8000 });
  });
});
