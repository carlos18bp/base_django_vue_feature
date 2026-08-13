import { test, expect } from '../helpers/test.js';
import { MANUAL_SEARCH } from '../helpers/flow-tags.js';

/**
 * E2E tests for the manual's search box (Fuse.js-backed, via useManualSearch).
 *
 * Covers finding and selecting a real result (success) and the no-match
 * empty state (display) — both driven by real typing into the searchbox,
 * never by calling the composable directly. No `page.clock`/fake timers:
 * the 120ms debounce is absorbed by Playwright's own assertion polling.
 */

test.describe('Manual — search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manual');
    await page.waitForLoadState('domcontentloaded');
  });

  test('searching finds a result and selecting it highlights the matching process card', {
    tag: [...MANUAL_SEARCH, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    // Bug this catches: a Fuse index misconfiguration hiding real results in
    // production (e.g. a dropped `keys` weight or threshold regression), or
    // the result-selection handler losing its scroll/highlight target.
    const searchbox = page.getByRole('searchbox', { name: /search the manual/i });
    await searchbox.fill('Homepage');

    const result = page.getByRole('option', { name: /homepage overview/i });
    await expect(result).toBeVisible();
    await result.click();

    await expect(page.locator('#homepage-overview')).toHaveAttribute('class', /ring-2/);
  });

  test('searching a non-matching term shows the no-results message', {
    tag: [...MANUAL_SEARCH, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // Bug this catches: the no-results branch getting stuck in a permanent
    // loading/blank state instead of rendering "No matches found." once the
    // debounced query settles.
    const searchbox = page.getByRole('searchbox', { name: /search the manual/i });
    await searchbox.fill('zzzqqqnomatch');

    await expect(page.getByText('No matches found.')).toBeVisible();
  });
});
