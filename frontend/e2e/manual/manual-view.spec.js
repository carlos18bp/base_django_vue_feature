import { test, expect } from '../helpers/test.js';
import { MANUAL_VIEW } from '../helpers/flow-tags.js';

/**
 * E2E test for the public Manual page.
 *
 * Reaches /manual by clicking the header nav link — a display flow, so
 * reachability itself is part of the behavior under test — then follows a
 * sidebar link to a process card and confirms the page actually scrolls to
 * it. Deterministic: MANUAL_SECTIONS is a static import, no backend calls.
 */

test.describe('Manual — browse sections', () => {
  test('reaches Manual from the header nav and the sidebar scrolls to a process card', {
    tag: [...MANUAL_VIEW, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // Bug this catches: a broken sidebar anchor (href="#" + process.id not
    // matching the rendered ProcessCard's own :id) or the header nav link
    // pointing at the wrong route.
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('link', { name: 'Manual' }).first().click();

    await expect(page).toHaveURL(/\/manual/);
    // Scoped to the heading role: "Homepage overview" also appears as the
    // sidebar link's own text, which would otherwise make this ambiguous.
    await expect(page.getByRole('heading', { name: 'Homepage overview' })).toBeVisible();

    await page.getByRole('link', { name: 'Homepage overview' }).click();

    await expect(page.locator('#homepage-overview')).toBeInViewport();
  });
});
