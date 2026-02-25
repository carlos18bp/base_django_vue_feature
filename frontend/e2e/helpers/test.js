/**
 * Custom E2E test base.
 *
 * All spec files must import test and expect from this module instead of
 * directly from @playwright/test. This enables global behaviors (error
 * logging, custom fixtures) in a single place.
 */

import { test as base, expect } from '@playwright/test';

const shouldLogErrors = ['1', 'true', 'yes'].includes(
  String(process.env.E2E_LOG_ERRORS || process.env.E2E_LOG_CONSOLE_ERRORS || '').toLowerCase(),
);

export const test = base.extend({
  page: async ({ page }, use) => {
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(25000);
    await page.addInitScript(() => {
      window.__E2E_DISABLE_GOOGLE_LOGIN__ = true;
    });

    if (shouldLogErrors) {
      page.on('pageerror', (err) => {
        console.error('[e2e:pageerror]', err);
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.error('[e2e:console:error]', msg.text());
        }
      });
    }

    await use(page);
  },
});

export { expect };
