import { test, expect } from '../helpers/test.js';
import { BLOG_DETAIL_VIEW, BLOG_DETAIL_NOT_FOUND } from '../helpers/flow-tags.js';

/**
 * E2E tests for the blog detail flow.
 *
 * A real post renders its article region with a title; a missing id renders the
 * same region empty, because blog/Detail.vue initializes `blog` to reactive({})
 * (always truthy) and leaves it empty when the id is not found. Tests reach the
 * post by clicking it in the list.
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
    const heading = page.getByTestId('blog-article').getByRole('heading', { level: 1 });
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

  test('a non-existent post renders the article region with an empty title', {
    tag: [...BLOG_DETAIL_NOT_FOUND, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // quality: allow-no-interaction (no UI path to a non-existent post; direct navigation is the only way)
    // quality: allow-deep-link (same reason: there is no post link that leads to a missing id, so a UI-driven entry point does not exist for this display case)
    // The scaffold has no real not-found handling: `blog` is reactive({}), always truthy,
    // so the article region always renders and stays empty for a missing id. Asserting the
    // empty title documents that degraded behavior — a template gap worth closing.
    await page.goto('/blog/999999');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('blog-article').getByRole('heading', { level: 1 })).toHaveText('');
  });
});
