import { test, expect } from './setup.js';

test.describe('Home carousels', () => {
  test('product carousel can navigate', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.waitForTimeout(3200);

    const productItems = page.locator('[data-testid="product-carousel-item"]');
    await expect(productItems.first()).toBeVisible();

    const carousel = page.locator('[data-testid="product-carousel-list"]');
    const nextButton = page.locator('[data-testid="product-carousel-next"]');
    const prevButton = page.locator('[data-testid="product-carousel-prev"]');

    const initialTransform = await carousel.evaluate((el) => getComputedStyle(el).transform);
    await nextButton.click();
    await page.waitForTimeout(200);
    const afterNext = await carousel.evaluate((el) => getComputedStyle(el).transform);

    await nextButton.click();
    await page.waitForTimeout(200);

    await prevButton.click();
    await page.waitForTimeout(200);

    await prevButton.click();
    await page.waitForTimeout(200);
    const afterPrev = await carousel.evaluate((el) => getComputedStyle(el).transform);

    expect(initialTransform).toBeTruthy();
    expect(afterNext).toBeTruthy();
    expect(afterPrev).toBeTruthy();
  });

  test('blog carousel can navigate', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    const blogItems = page.locator('[data-testid="blog-carousel-item"]');
    await expect(blogItems.first()).toBeVisible();

    const carousel = page.locator('[data-testid="blog-carousel-list"]');
    await page.locator('[data-testid="blog-carousel-next"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-testid="blog-carousel-next"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-testid="blog-carousel-prev"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-testid="blog-carousel-prev"]').click();
    await page.waitForTimeout(200);

    const transform = await carousel.evaluate((el) => getComputedStyle(el).transform);
    expect(transform).toBeTruthy();
  });
});
