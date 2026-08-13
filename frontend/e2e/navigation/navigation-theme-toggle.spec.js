import { test, expect } from '../helpers/test.js';
import { THEME_TOGGLE } from '../helpers/flow-tags.js';

/**
 * E2E test for the Light/Dark/System theme switcher.
 *
 * Covers switching to Dark from the header menu and the preference
 * surviving a full page reload (localStorage rehydration via the theme
 * store's `persist` option and index.html's anti-FOUC script).
 */

test.describe('Navigation — theme toggle', () => {
  // No beforeEach clearing storage here: a fresh Playwright context already
  // starts with empty localStorage, and page.addInitScript(() =>
  // localStorage.clear()) re-runs on EVERY navigation in the page — which
  // would silently wipe the very "dark" preference this test sets, right
  // before the page.reload() below that is supposed to prove it persisted.

  test('switching to Dark applies the dark class and it survives a reload', {
    tag: [...THEME_TOGGLE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    // Bug this catches: resolvedMode/applyTheme regressing in a way a
    // store-only unit test cannot catch — this proves the real Headless UI
    // menu wiring AND localStorage rehydration on an actual page load,
    // neither of which a mocked/fixture-based unit test exercises.
    // quality: allow-conditional (house pattern mirrored from navigation-search.spec.js/navigation-cart-overlay.spec.js — dead today since projects: [] only runs Desktop Chrome and line below forces 1280px, kept as the guard for when a Mobile Chrome project is re-enabled in playwright.config.mjs)
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) test.skip(true, 'Desktop-only flow — theme toggle hidden on mobile (hidden lg:flex)');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: 'Toggle theme' }).click();
    // Headless UI's <MenuItem> imposes role="menuitem" on its slot content
    // regardless of the underlying element (a <button> here) — confirmed via
    // the live accessibility tree, not the raw template markup.
    await page.getByRole('menuitem', { name: 'Dark', exact: true }).click();

    await expect(page.locator('html')).toHaveAttribute('class', /dark/);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('html')).toHaveAttribute('class', /dark/);
  });
});
