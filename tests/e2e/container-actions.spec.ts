import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Container Actions", () => {
  test("can stop and start a container", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Find a running container
    const runningContainer = page.locator('text=running').first();
    await expect(runningContainer).toBeVisible();
    
    // Get the container row
    const containerRow = runningContainer.locator('xpath=ancestor::div[contains(@class, "bp5-card")]');
    
    // Click stop button
    const stopButton = containerRow.locator('button:has-text("Stop")');
    if (await stopButton.count() > 0) {
      await stopButton.click();
      await page.waitForTimeout(2000);
      
      // Verify container is stopped
      await expect(containerRow.locator('text=exited').or(containerRow.locator('text=stopped'))).toBeVisible({ timeout: 10000 });
      
      // Start it back up
      const startButton = containerRow.locator('button:has-text("Start")');
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Verify container is running again
      await expect(containerRow.locator('text=running')).toBeVisible({ timeout: 10000 });
    }
  });
});
