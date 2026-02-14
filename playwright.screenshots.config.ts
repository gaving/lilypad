import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Screenshot Generation
 * 
 * These tests are for generating documentation screenshots only.
 * Run manually with: pnpm exec playwright test --config=playwright.screenshots.config.ts
 * 
 * Note: Requires Lilypad to be running on http://localhost:8080 with test containers
 */

export default defineConfig({
  testDir: "./tests/screenshots",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
