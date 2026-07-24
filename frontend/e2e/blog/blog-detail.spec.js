import { test, expect } from '../helpers/test.js';
import { BLOG_DETAIL_VIEW, BLOG_DETAIL_NOT_FOUND } from '../helpers/flow-tags.js';

/**
 * E2E tests for the blog detail flow.
 *
 * The detail view renders `<h1>{{ blog.title }}</h1>` only under `v-if="blog"`,
 * so a real post shows an article heading and a missing one shows none. Tests
 * reach the post by clicking it in the list, and the not-found case asserts the
 * absence of the article heading rather than the URL that was typed.
 */

test.describe('Blog — detail view', () => {
  test('opens a post from the list and shows its article heading', {
    tag: [...BLOG_DETAIL_VIEW, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/blogs');
    await page.waitForLoadState('domcontentloaded');

    const blogLinks = page.locator('a[href*="/blog/"]');
    await expect(blogLinks.first()).toBeVisible({ timeout: 15000 });
    // quality: allow-fragile-selector (first post from a dynamic server-rendered list; no stable per-item id)
    await blogLinks.first().click();

    await expect(page).toHaveURL(/\/blog\/\d+/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).not.toHaveText('');
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

  test('a non-existent post renders no article heading', {
    tag: [...BLOG_DETAIL_NOT_FOUND, '@role:shared', '@outcome:error'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (there is no UI path to a non-existent post; direct navigation is the only way to exercise the missing-post case)
    await page.goto('/blog/999999');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
  });
});
