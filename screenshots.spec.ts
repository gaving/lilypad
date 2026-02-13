import { test } from "@playwright/test";
import { setTimeout } from "timers/promises";

const BASE_URL = "http://localhost:8080";
const SCREENSHOT_DIR = "./screenshots";

// Helper to take screenshot
async function takeScreenshot(page, name, viewport = { width: 1200, height: 800 }) {
  console.log(`Taking screenshot: ${name}...`);
  await page.setViewportSize(viewport);
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: false,
  });
  console.log(`✓ Saved: ${SCREENSHOT_DIR}/${name}.png`);
}

test.describe("Lilypad Screenshots", () => {
  test("Dashboard Light Mode - Desktop", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(5000); // Wait for containers to load
    await takeScreenshot(page, "dashboard-light", { width: 1200, height: 800 });
  });

  test("Dashboard Dark Mode - Desktop", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(3000);

    // Click the dark mode toggle button by data-testid
    const darkModeButton = page.locator('[data-testid="dark-mode-toggle"]');
    await darkModeButton.click();
    await setTimeout(1500); // Wait for theme transition

    await takeScreenshot(page, "dashboard-dark", { width: 1200, height: 800 });
  });

  test("Bulk Actions - Desktop", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(3000);

    // Look for Edit button
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      await setTimeout(1000);
    }

    // Click first two checkboxes
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
      await checkboxes[i].click();
      await setTimeout(500);
    }

    await setTimeout(1000);
    await takeScreenshot(page, "bulk-actions", { width: 1200, height: 800 });
  });

  test("Dashboard - Mobile", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(3000);
    await takeScreenshot(page, "dashboard-mobile", { width: 375, height: 812 });
  });

  test("Dashboard - Tablet", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(3000);
    await takeScreenshot(page, "dashboard-tablet", { width: 768, height: 1024 });
  });
});
