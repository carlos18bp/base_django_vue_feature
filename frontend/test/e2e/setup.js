/**
 * E2E Test Setup
 * Configuración global para pruebas Playwright
 */

import { test as base } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const coverageEnabled = ['1', 'true', 'yes'].includes(
  String(process.env.E2E_COVERAGE || '').toLowerCase(),
);
const logConsoleErrors = ['1', 'true', 'yes'].includes(
  String(process.env.E2E_LOG_CONSOLE_ERRORS || '').toLowerCase(),
);
const coverageDir = path.resolve(process.cwd(), 'coverage-e2e', '.v8-coverage');

const sanitizeFilename = (value) => value.replace(/[^a-z0-9-_]+/gi, '_');
const resolveTitlePath = (testInfo) => {
  if (typeof testInfo.titlePath === 'function') {
    return testInfo.titlePath();
  }

  if (Array.isArray(testInfo.titlePath)) {
    return testInfo.titlePath;
  }

  return [testInfo.title || 'unknown-test'];
};

/**
 * Fixture personalizado para agregar helpers globales
 */
export const test = base.extend({
  // Agregar delay automático entre acciones para estabilidad
  page: async ({ page }, use, testInfo) => {
    // Configurar timeouts por defecto
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(15000);
    
    // Interceptar errores de consola si es necesario
    if (logConsoleErrors) {
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.log(`Browser console error: ${msg.text()}`);
        }
      });
    }
    
    if (coverageEnabled) {
      await page.coverage.startJSCoverage({ resetOnNavigation: false });
    }

    try {
      await use(page);
    } finally {
      if (coverageEnabled) {
        const coverage = await page.coverage.stopJSCoverage();
        fs.mkdirSync(coverageDir, { recursive: true });
        const titlePath = resolveTitlePath(testInfo).join('-');
        const fileName = sanitizeFilename(
          `${testInfo.workerIndex}-${titlePath}`,
        );
        fs.writeFileSync(
          path.join(coverageDir, `${fileName}.json`),
          JSON.stringify(coverage),
        );
      }
    }
  },
});

export { expect } from '@playwright/test';
