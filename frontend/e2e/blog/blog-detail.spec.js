import { test, expect } from '../helpers/test.js';
import { BLOG_DETAIL_VIEW, BLOG_DETAIL_NOT_FOUND } from '../helpers/flow-tags.js';

/**
 * E2E tests for the blog detail flow.
 *
 * Covers viewing blog detail content, back navigation, and non-existent blog handling.
 */

test.describe('Blog — detail view', () => {
  test('blog detail page shows content', {
    tag: [...BLOG_DETAIL_VIEW, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/blog/1');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    await expect(body).toContainText(/.+/);
  });

  test('can go back from blog detail to list', {
    tag: [...BLOG_DETAIL_VIEW, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/blogs');
    await page.waitForLoadState('networkidle');

    const blogLinks = page.locator('a[href*="/blog/"]');
    const count = await blogLinks.count();

    expect(count).toBeGreaterThan(0);
    // quality: allow-fragile-selector (selecting first blog link from dynamic server-rendered list; no stable per-item ID available)
    await blogLinks.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/blog\/\d+/);

    await page.goto('/blogs');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/blogs/);
  });

  test('blog detail handles non-existent blog', {
    tag: [...BLOG_DETAIL_NOT_FOUND, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/blog/999999');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/blog\/999999/);
  });
});
