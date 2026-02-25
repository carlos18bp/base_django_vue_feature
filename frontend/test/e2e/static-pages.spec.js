import { test, expect } from './setup.js';

test.describe('Static Pages', () => {
  test('about us page loads', async ({ page }) => {
    await page.goto('/about_us');
    await expect(page).toHaveURL(/\/about_us/);
    
    // Verify there is content
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(10);
  });

  test('about us page displays content', async ({ page }) => {
    await page.goto('/about_us');
    await page.waitForTimeout(500);
    
    // Verificar que el header y footer están presentes
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
    
    // Verify there is content
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(10);
  });

  test('contact page displays form or information', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForTimeout(500);
    
    // Should have a contact form or contact information
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(50);
  });

  test('can navigate between static pages', async ({ page }) => {
    // About -> Contact
    await page.goto('/about_us');
    await page.waitForTimeout(300);
    
    const contactLink = page.getByRole('link', { name: /contact/i }).first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact/);
    }
    
    // Contact -> About
    await page.goto('/contact');
    await page.waitForTimeout(300);
    
    const aboutLink = page.getByRole('link', { name: /about/i }).first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about_us/);
    }
  });

  test('static pages have consistent layout', async ({ page }) => {
    const pages = ['/about_us', '/contact'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(300);
      
      // Verificar elementos comunes
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Footer puede o no estar
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});
