import { test } from "@playwright/test";
import { setTimeout } from "timers/promises";

const BASE_URL = "http://localhost:8080";
const SCREENSHOT_DIR = "./screenshots";

// Helper to take screenshot
async function takeScreenshot(page, name) {
  console.log(`Taking screenshot: ${name}...`);
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.screenshot({
    path: `${SCREENSHOT_DIR}/${name}.png`,
    fullPage: false,
  });
  console.log(`✓ Saved: ${SCREENSHOT_DIR}/${name}.png`);
}

test.describe("Lilypad Screenshots", () => {
  test("Dashboard Light Mode", async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await setTimeout(3000);
    await takeScreenshot(page, "dashboard-light");
  });

  test("Dashboard Dark Mode", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(2000);

    // Try to click dark mode toggle (look for moon/sun icon)
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const text = await button.textContent().catch(() => "");
      if (text.includes("🌙") || text.includes("☀️") || text.includes("moon") || text.includes("sun")) {
        await button.click();
        await setTimeout(1000);
        break;
      }
    }

    await takeScreenshot(page, "dashboard-dark");
  });

  test("Bulk Actions", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await setTimeout(2000);

    // Look for Edit button and click it
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      await setTimeout(1000);
    }

    // Look for checkboxes and click first two
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
      await checkboxes[i].click();
      await setTimeout(500);
    }

    await setTimeout(1000);
    await takeScreenshot(page, "bulk-actions");
  });
});
