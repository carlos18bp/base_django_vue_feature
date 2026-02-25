import { test, expect } from './setup.js';

test.describe('Navigation', () => {
  test('home page loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    
    // Verificar que el header está presente
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('can navigate to blogs page', async ({ page }) => {
    await page.goto('/');
    
    // Buscar link a blogs (puede estar en navegación o en la página)
    const blogsLink = page.getByRole('link', { name: /blogs?/i }).first();
    await blogsLink.click();
    
    await expect(page).toHaveURL(/\/blogs/);
  });

  test('can navigate to catalog page', async ({ page }) => {
    await page.goto('/');
    
    // Buscar link a catalog/productos
    const catalogLink = page.getByRole('link', { name: /(catalog|products|productos)/i }).first();
    await catalogLink.click();
    
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('can navigate to about us page', async ({ page }) => {
    // Direct navigation if link is not available
    await page.goto('/about_us');
    
    await expect(page).toHaveURL(/\/about_us/);
    
    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('can navigate to contact page', async ({ page }) => {
    // Direct navigation if link is not available
    await page.goto('/contact');
    
    await expect(page).toHaveURL(/\/contact/);
    
    // Verify page loaded
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('navigation persists across page changes', async ({ page }) => {
    await page.goto('/');
    
    // Navegar a blogs
    await page.goto('/blogs');
    await expect(page).toHaveURL(/\/blogs/);
    
    // Navegar a catalog
    await page.goto('/catalog');
    await expect(page).toHaveURL(/\/catalog/);
    
    // Verificar que el header sigue visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
