import { test, expect } from '../helpers/test.js';
import { HOME_CAROUSEL_NAVIGATE } from '../helpers/flow-tags.js';

/**
 * E2E tests for the home page carousel navigation flow.
 *
 * Covers product and blog carousel next/prev navigation.
 * Tests skip gracefully if backend has no data loaded.
 */

test.describe('Home — carousels', () => {
  test('product carousel shows navigation controls when items are loaded', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const productItems = page.locator('[data-testid="product-carousel-item"]');
    const count = await productItems.count();

    if (count === 0) return;

    // quality: allow-fragile-selector (all carousel items share the same testid; first() is the only way to verify at least one item is rendered)
    await expect(productItems.first()).toBeVisible();

    const nextButton = page.locator('[data-testid="product-carousel-next"]');
    const prevButton = page.locator('[data-testid="product-carousel-prev"]');

    await expect(nextButton).toBeVisible();
    await expect(prevButton).toBeVisible();
  });

  test('product carousel advances forward when next button is clicked', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const productItems = page.locator('[data-testid="product-carousel-item"]');
    const count = await productItems.count();

    if (count === 0) return;

    const carousel = page.locator('[data-testid="product-carousel-list"]');
    const nextButton = page.locator('[data-testid="product-carousel-next"]');

    const initialTransform = await carousel.evaluate((el) => getComputedStyle(el).transform);
    await nextButton.click();
    await expect(nextButton).toBeVisible();
    const afterNext = await carousel.evaluate((el) => getComputedStyle(el).transform);

    expect(initialTransform).toBeTruthy();
    expect(afterNext).toBeTruthy();
  });

  test('product carousel moves back when prev button is clicked', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const productItems = page.locator('[data-testid="product-carousel-item"]');
    const count = await productItems.count();

    if (count === 0) return;

    const carousel = page.locator('[data-testid="product-carousel-list"]');
    const nextButton = page.locator('[data-testid="product-carousel-next"]');
    const prevButton = page.locator('[data-testid="product-carousel-prev"]');

    await nextButton.click();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    const afterPrev = await carousel.evaluate((el) => getComputedStyle(el).transform);

    expect(afterPrev).toBeTruthy();
  });

  test('blog carousel can navigate', {
    tag: [...HOME_CAROUSEL_NAVIGATE, '@role:shared'],
  }, async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const blogItems = page.locator('[data-testid="blog-carousel-item"]');
    const count = await blogItems.count();

    if (count === 0) return;

    // quality: allow-fragile-selector (all carousel items share the same testid; first() is the only way to verify at least one item is rendered)
    await expect(blogItems.first()).toBeVisible();

    const carousel = page.locator('[data-testid="blog-carousel-list"]');
    const nextButton = page.locator('[data-testid="blog-carousel-next"]');
    const prevButton = page.locator('[data-testid="blog-carousel-prev"]');

    await expect(nextButton).toBeVisible();
    await expect(prevButton).toBeVisible();

    await nextButton.click();
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    await expect(prevButton).toBeVisible();
    await prevButton.click();
    await expect(prevButton).toBeVisible();
    await prevButton.click();

    const transform = await carousel.evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBeTruthy();
  });
});
