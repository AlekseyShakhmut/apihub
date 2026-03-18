import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'api-tests/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright'], // для Allure
    ['list']
  ],
  use: {
    baseURL: 'https://api.freeapi.app/api/v1/',
    trace: 'retain-on-failure',
    extraHTTPHeaders: {
      'accept': 'application/json',
    },
  },
  outputDir: 'test-results',
});

//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },
//
//     {
//       name: 'firefox',
//       use: { ...devices['Desktop Firefox'] },
//     },
//
//     {
//       name: 'webkit',
//       use: { ...devices['Desktop Safari'] },
//     },
//
//     /* Test against mobile viewports. */
//     // {
//     //   name: 'Mobile Chrome',
//     //   use: { ...devices['Pixel 5'] },
//     // },
//     // {
//     //   name: 'Mobile Safari',
//     //   use: { ...devices['iPhone 12'] },
//     // },
//
//     /* Test against branded browsers. */
//     // {
//     //   name: 'Microsoft Edge',
//     //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
//     // },
//     // {
//     //   name: 'Google Chrome',
//     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//     // },
//   ],
//
//   /* Run your local dev server before starting the tests */
//   // webServer: {
//   //   command: 'npm run start',
//   //   url: 'http://localhost:3000',
//   //   reuseExistingServer: !process.env.CI,
//   // },
// });
