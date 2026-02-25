/**
 * E2E Test Helpers
 * Funciones utilitarias para pruebas Playwright
 */

/**
 * Espera a que la página termine de cargar y las peticiones API se completen
 */
export async function waitForPageLoad(page, timeout = 2000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Llena un formulario con datos
 */
export async function fillForm(page, formData) {
  for (const [selector, value] of Object.entries(formData)) {
    const input = page.locator(selector).first();
    if (await input.isVisible()) {
      await input.fill(value);
    }
  }
}

/**
 * Simula autenticación (útil para tests que requieren usuario autenticado)
 */
export async function login(page, email = 'test@example.com', password = 'testpass') {
  await page.goto('/sign_in');
  await page.waitForTimeout(500);
  
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  const submitButton = page.getByRole('button', { name: /(sign in|login|entrar)/i }).first();
  await submitButton.click();
  
  await page.waitForTimeout(2000);
}

/**
 * Cierra sesión
 */
export async function logout(page) {
  const signOutButton = page.getByRole('button', { name: /(sign out|logout|salir)/i }).first();
  
  if (await signOutButton.isVisible()) {
    await signOutButton.click();
    await page.waitForTimeout(1000);
  }
}

/**
 * Agrega un producto al carrito
 */
export async function addToCart(page, productId = 1, quantity = 1) {
  await page.goto(`/product/${productId}`);
  await page.waitForTimeout(1000);
  
  // Establecer cantidad si es necesario
  const quantityInput = page.locator('input[type="number"]').first();
  if (await quantityInput.isVisible()) {
    await quantityInput.fill(String(quantity));
  }
  
  const addButton = page.getByRole('button', { name: /(add to cart|agregar)/i }).first();
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(500);
  }
}

/**
 * Limpia el carrito de compras
 */
export async function clearCart(page) {
  // Esto depende de la implementación
  // Por ahora, simplemente recargar el contexto
  await page.context().clearCookies();
  await page.reload();
}

/**
 * Verifica que un elemento esté visible con timeout personalizado
 */
export async function expectVisible(locator, timeout = 5000) {
  await locator.waitFor({ state: 'visible', timeout });
}

/**
 * Toma screenshot con nombre descriptivo
 */
export async function takeScreenshot(page, name) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Espera a que una API específica responda
 */
export async function waitForAPI(page, urlPattern, timeout = 10000) {
  return page.waitForResponse(
    (response) => response.url().includes(urlPattern) && response.status() === 200,
    { timeout }
  );
}

/**
 * Simula carga lenta de red
 */
export async function simulateSlowNetwork(page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50 * 1024, // 50 KB/s
    uploadThroughput: 20 * 1024,   // 20 KB/s
    latency: 500,                  // 500ms latency
  });
}

/**
 * Verifica accesibilidad básica de la página
 */
export async function checkBasicAccessibility(page) {
  // Verificar que hay un título
  const title = await page.title();
  if (!title || title.length === 0) {
    throw new Error('La página no tiene título');
  }
  
  // Verificar que hay contenido
  const body = await page.textContent('body');
  if (!body || body.length < 50) {
    throw new Error('La página no tiene suficiente contenido');
  }
  
  return true;
}

/**
 * Scroll hasta un elemento
 */
export async function scrollToElement(page, selector) {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

/**
 * Cuenta elementos que coinciden con un selector
 */
export async function countElements(page, selector) {
  return await page.locator(selector).count();
}

/**
 * Verifica que hay datos fake en el backend
 */
export async function ensureFakeData(page) {
  // Hacer una petición a la API para verificar que hay datos
  const response = await page.request.get('http://127.0.0.1:8000/api/blogs/');
  
  if (response.ok()) {
    const data = await response.json();
    return Array.isArray(data) && data.length > 0;
  }
  
  return false;
}
