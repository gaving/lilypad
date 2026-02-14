import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Dashboard", () => {
  test("page loads with lilypad branding", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=Lilypad").first()).toBeVisible();
  });

  test("displays test containers", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    await expect(page.locator("text=test-api-1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=test-web-1")).toBeVisible();
    await expect(page.locator("text=test-db-1")).toBeVisible();
    await expect(page.locator("text=running").first()).toBeVisible();
  });
});
