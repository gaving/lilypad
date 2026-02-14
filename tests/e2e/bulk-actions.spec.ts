import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Bulk Actions", () => {
  test("can select multiple containers via checkboxes", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Enter edit mode
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Get all checkboxes and click first two
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Click first two checkboxes
    await checkboxes.nth(0).click();
    await page.waitForTimeout(500);
    await checkboxes.nth(1).click();
    await page.waitForTimeout(500);
    
    // Verify checkboxes are checked
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
  });

  test("bulk stop button appears when containers selected", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Enter edit mode
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Select a container
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await page.waitForTimeout(500);
    
    // Verify bulk action buttons appear
    await expect(page.locator('button:has-text("Stop Selected")')).toBeVisible();
    await expect(page.locator('button:has-text("Start Selected")')).toBeVisible();
  });
});
