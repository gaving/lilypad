import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Bulk Actions", () => {
  test("can select multiple containers via checkboxes", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Enter edit mode using the toggle button
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);
    
    // Get all checkboxes and click first two
    // Note: Blueprint.js checkboxes have an overlay span that intercepts clicks,
    // so we need to use force: true to click through it
    const checkboxes = page.locator('[data-testid="container-checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Click first two checkboxes (force to bypass Blueprint.js overlay)
    await checkboxes.nth(0).click({ force: true });
    await page.waitForTimeout(500);
    await checkboxes.nth(1).click({ force: true });
    await page.waitForTimeout(500);
    
    // Verify checkboxes are checked
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
  });

  test("bulk stop button appears when containers selected", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Enter edit mode using the toggle button
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);
    
    // Select a container (force to bypass Blueprint.js overlay)
    const checkboxes = page.locator('[data-testid="container-checkbox"]');
    await checkboxes.nth(0).click({ force: true });
    await page.waitForTimeout(500);
    
    // Verify bulk action buttons appear
    await expect(page.locator('button:has-text("Stop Selected")')).toBeVisible();
    await expect(page.locator('button:has-text("Start Selected")')).toBeVisible();
  });
});
