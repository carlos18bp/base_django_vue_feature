import { test, expect } from '../helpers/test.js';
import { BLOG_LIST_VIEW } from '../helpers/flow-tags.js';

/**
 * E2E tests for the blog listing flow.
 *
 * Covers viewing the blog list and navigating to blog detail.
 */

test.describe('Blog — list view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blogs');
  });

  test('blogs list page loads with content', {
    tag: [...BLOG_LIST_VIEW, '@role:shared'],
  }, async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/blogs/);

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    await expect(body).toContainText(/.+/);
  });

  test('can navigate to blog detail from list', {
    tag: [...BLOG_LIST_VIEW, '@role:shared'],
  }, async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const blogLinks = page.locator('a[href*="/blog/"]');
    const count = await blogLinks.count();

    expect(count).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first blog link from dynamic server-rendered list; no stable per-item ID available)
    await blogLinks.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/blog\/\d+/);
  });
});
