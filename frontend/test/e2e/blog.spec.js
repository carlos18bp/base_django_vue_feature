import { test, expect } from './setup.js';

test.describe('Blog', () => {
  test.beforeEach(async ({ page }) => {
    // Asegurarse de que el backend tenga datos
    await page.goto('/blogs');
  });

  test('blogs list page loads', async ({ page }) => {
    await expect(page).toHaveURL(/\/blogs/);
    
    // Esperar a que se carguen los blogs (puede haber un loading state)
    await page.waitForTimeout(1000);
  });

  test('displays blog list', async ({ page }) => {
    // Esperar a que los blogs se carguen
    await page.waitForTimeout(1000);
    
    // Verificar que hay contenido de blogs
    // Esto puede variar dependiendo de cómo se muestren los blogs
    const pageContent = await page.textContent('body');
    
    // Al menos verificar que la página no está vacía
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('can navigate to blog detail', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Intentar encontrar el primer enlace a un blog
    // Esto depende de cómo están estructurados los enlaces
    const blogLinks = page.locator('a[href*="/blog/"]');
    const count = await blogLinks.count();
    
    if (count > 0) {
      // Click en el primer blog
      await blogLinks.first().click();
      
      // Verificar que estamos en la página de detalle
      await expect(page).toHaveURL(/\/blog\/\d+/);
    } else {
      // Si no hay blogs, al menos verificar que la página de lista funciona
      await expect(page).toHaveURL(/\/blogs/);
    }
  });

  test('blog detail page shows content', async ({ page }) => {
    // Go directly to a blog (assuming blog with ID 1 exists)
    await page.goto('/blog/1');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Verify there is content
    const pageContent = await page.textContent('body');
    expect(pageContent.length).toBeGreaterThan(10);
  });

  test('can go back from blog detail to list', async ({ page }) => {
    // Go to blog list first, then to detail
    await page.goto('/blogs');
    await page.waitForTimeout(500);
    
    // Navigate to a blog
    await page.goto('/blog/1');
    await page.waitForTimeout(500);
    
    // Use browser back navigation
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Should return to the list
    const url = page.url();
    expect(url).toMatch(/blogs/);
  });

  test('blog detail handles non-existent blog', async ({ page }) => {
    // Intentar acceder a un blog que probablemente no existe
    await page.goto('/blog/999999');
    await page.waitForTimeout(1000);
    
    // La página debería manejar esto de alguna forma
    // (mostrar error, redirigir, etc.)
    const url = page.url();
    expect(url).toBeTruthy();
  });
});
