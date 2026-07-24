import { test, expect } from '../helpers/test.js';
import { BLOG_LIST_VIEW } from '../helpers/flow-tags.js';

/**
 * E2E test for the blog listing flow.
 *
 * Opens a post from the list by clicking it. The earlier "page loads with
 * content" test only asserted the body was non-empty and is dropped — this
 * navigation test covers the flow and verifies the list is usable.
 */

test.describe('Blog — list view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blogs');
  });

  test('can navigate to blog detail from the list', {
    tag: [...BLOG_LIST_VIEW, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    const blogLinks = page.locator('a[href*="/blog/"]');
    await expect(blogLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first post from a dynamic server-rendered list; no stable per-item id)
    await blogLinks.first().click();

    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/blog\/\d+/);
  });
});
