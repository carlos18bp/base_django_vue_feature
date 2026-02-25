import { test, expect } from './setup.js';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`home page loads on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      await expect(page).toHaveURL(/\/$/);
      
      // Verificar que hay contenido visible
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test(`catalog page is responsive on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/catalog');
      await page.waitForTimeout(1000);
      
      // Verificar que la página se carga
      await expect(page).toHaveURL(/\/catalog/);
      
      // Verificar que hay contenido
      const pageContent = await page.textContent('body');
      expect(pageContent.length).toBeGreaterThan(50);
    });

    test(`navigation works on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // En mobile puede haber un menú hamburguesa
      if (viewport.name === 'mobile') {
        const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger, button.menu').first();
        if (await hamburger.isVisible()) {
          await hamburger.click();
          await page.waitForTimeout(300);
        }
      }
      
      // Verificar que la navegación está accesible
      const header = page.locator('header');
      await expect(header).toBeVisible();
    });
  }

  test('mobile menu toggles correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Buscar menú hamburguesa
    const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger, button:has-text("menu")').first();
    
    if (await hamburger.isVisible()) {
      // Abrir menú
      await hamburger.click();
      await page.waitForTimeout(300);
      
      // Verificar que el menú se abrió (buscar nav o menu visible)
      const mobileNav = page.locator('nav, [role="navigation"]').first();
      await expect(mobileNav).toBeVisible();
      
      // Cerrar menú
      const closeButton = page.locator('button:has-text("Close menu"), [data-testid="mobile-menu-close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('images are responsive', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForTimeout(1000);
    
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      const firstImage = images.first();
      const width = await firstImage.evaluate(img => img.clientWidth);
      
      // Verificar que la imagen tiene un ancho razonable
      expect(width).toBeGreaterThan(0);
      expect(width).toBeLessThan(2000);
    }
  });

  test('text is readable on all viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForTimeout(300);
      
      // Verificar que hay texto visible
      const body = page.locator('body');
      const text = await body.textContent();
      
      expect(text.length).toBeGreaterThan(50);
    }
  });
});
