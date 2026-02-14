import { defineConfig, devices } from "@playwright/test";

/**
 * Main Playwright Configuration for E2E Tests
 * 
 * Run E2E tests with: pnpm exec playwright test
 * Run with UI: pnpm exec playwright test --ui
 * Run specific test: pnpm exec playwright test tests/e2e/dashboard.spec.ts
 */

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.LILYPAD_URL || "http://localhost:8888",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "./test-results",
});
