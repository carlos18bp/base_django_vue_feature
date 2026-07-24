import { test, expect } from '../helpers/test.js';
import { BLOG_DETAIL_VIEW, BLOG_DETAIL_NOT_FOUND } from '../helpers/flow-tags.js';

/**
 * E2E tests for the blog detail flow.
 *
 * The article body renders inside `<div v-if="blog" data-testid="blog-article">`,
 * so a real post shows the article and a missing one shows none. Tests reach the
 * post by clicking it in the list; the not-found case asserts the absence of the
 * article region rather than the URL that was typed.
 */

test.describe('Blog — detail view', () => {
  test('opens a post from the list and shows its article', {
    tag: [...BLOG_DETAIL_VIEW, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/blogs');
    await page.waitForLoadState('domcontentloaded');

    const blogLinks = page.locator('a[href*="/blog/"]');
    await expect(blogLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first post from a dynamic server-rendered list; no stable per-item id)
    await blogLinks.first().click();

    await expect(page).toHaveURL(/\/blog\/\d+/);
    await expect(page.getByTestId('blog-article')).toBeVisible({ timeout: 15000 });
  });

  test('can go back from a post to the list', {
    tag: [...BLOG_DETAIL_VIEW, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/blogs');
    await page.waitForLoadState('domcontentloaded');

    const blogLinks = page.locator('a[href*="/blog/"]');
    await expect(blogLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first post from a dynamic server-rendered list; no stable per-item id)
    await blogLinks.first().click();
    await expect(page).toHaveURL(/\/blog\/\d+/);

    await page.goBack();
    await expect(page).toHaveURL(/\/blogs/);
  });

  test('a non-existent post renders no article', {
    tag: [...BLOG_DETAIL_NOT_FOUND, '@role:shared', '@outcome:error'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (there is no UI path to a non-existent post; direct navigation is the only way to exercise the missing-post case)
    await page.goto('/blog/999999');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByTestId('blog-article')).toHaveCount(0);
  });
});
