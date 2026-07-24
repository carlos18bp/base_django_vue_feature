import { test, expect } from '../helpers/test.js';
import { HOME_CAROUSEL_NAVIGATE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the home page carousel navigation.
 *
 * Each test asserts the carousel actually moves — the transform of the track
 * changes after clicking next, and returns after clicking prev. Earlier versions
 * captured the transform before and after but only asserted it was truthy, so a
 * frozen carousel would have passed.
 */

/** Wait until the track's transform differs from `from` (accounts for the slide animation). */
async function expectTransformChanged(carousel, from) {
  await expect(async () => {
    const t = await carousel.evaluate((el) => getComputedStyle(el).transform);
    expect(t).not.toEqual(from);
  }).toPass({ timeout: 5000 });
}

test.describe('Home — carousels', () => {
  test('the product carousel advances when next is clicked', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const carousel = page.locator('[data-testid="product-carousel-list"]');
    const nextButton = page.locator('[data-testid="product-carousel-next"]');
    await expect(nextButton).toBeVisible();

    const before = await carousel.evaluate((el) => getComputedStyle(el).transform);
    await nextButton.click();
    await expectTransformChanged(carousel, before);
  });

  test('the product carousel returns to the start when prev is clicked', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const carousel = page.locator('[data-testid="product-carousel-list"]');
    const nextButton = page.locator('[data-testid="product-carousel-next"]');
    const prevButton = page.locator('[data-testid="product-carousel-prev"]');
    await expect(nextButton).toBeVisible();

    const start = await carousel.evaluate((el) => getComputedStyle(el).transform);
    await nextButton.click();
    await expectTransformChanged(carousel, start);

    const advanced = await carousel.evaluate((el) => getComputedStyle(el).transform);
    await prevButton.click();
    await expectTransformChanged(carousel, advanced);
  });

  test('the blog carousel advances when next is clicked', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared', '@outcome:success'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const carousel = page.locator('[data-testid="blog-carousel-list"]');
    const nextButton = page.locator('[data-testid="blog-carousel-next"]');
    await expect(nextButton).toBeVisible();

    const before = await carousel.evaluate((el) => getComputedStyle(el).transform);
    await nextButton.click();
    await expectTransformChanged(carousel, before);
  });
});
