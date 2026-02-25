import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Reduced to 1 for environments with limited resources
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'e2e-results/results.json' }],
    ['./e2e/reporters/flow-coverage-reporter.mjs', { outputDir: 'e2e-results' }],
  ],
  webServer: [
    {
      command: '../backend/venv/bin/python ../backend/manage.py runserver 127.0.0.1:8001',
      url: 'http://127.0.0.1:8001/admin/',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Tablet',
    //   use: {
    //     viewport: { width: 768, height: 1024 },
    //     deviceScaleFactor: 2,
    //     isMobile: true,
    //     hasTouch: true,
    //   },
    // },
  ],
});
