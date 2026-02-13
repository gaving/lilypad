import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test("page loads with lilypad branding", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForTimeout(3000);
  
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("text=Lilypad").first()).toBeVisible();
});
