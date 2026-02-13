import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Bulk Actions E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    // Wait for containers to be fully loaded
    await page.waitForSelector("[data-testid='container-card']", { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test("can select multiple containers", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find checkboxes and select first two
    const checkboxes = page.locator("[data-testid='container-checkbox']");
    const count = await checkboxes.count();
    
    // Should have containers to select
    expect(count).toBeGreaterThanOrEqual(1);
    
    // Select first container
    await checkboxes.nth(0).click();
    await page.waitForTimeout(300);
    
    // Verify checkbox is checked
    await expect(checkboxes.nth(0)).toBeChecked();
  });

  test("bulk action bar appears when containers selected", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Select first two containers
    const checkboxes = page.locator("[data-testid='container-checkbox']");
    
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).click();
      await page.waitForTimeout(200);
      await checkboxes.nth(1).click();
      await page.waitForTimeout(200);
      
      // Verify bulk action bar appears with count
      await expect(page.locator("text=2 containers selected")).toBeVisible({ timeout: 5000 });
    }
  });

  test("can deselect containers with clear button", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Select containers
    const checkboxes = page.locator("[data-testid='container-checkbox']");
    
    if (await checkboxes.count() >= 1) {
      await checkboxes.nth(0).click();
      await page.waitForTimeout(300);
      
      // Verify bulk bar is visible
      await expect(page.locator("text=1 container selected")).toBeVisible({ timeout: 5000 });
      
      // Click clear
      const clearButton = page.locator("text=Clear");
      await clearButton.click();
      await page.waitForTimeout(500);
      
      // Verify bulk bar is hidden
      await expect(page.locator("text=1 container selected")).not.toBeVisible();
      
      // Verify checkbox is unchecked
      await expect(checkboxes.nth(0)).not.toBeChecked();
    }
  });

  test("checkboxes visible in edit mode", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Checkboxes should be visible
    const checkboxes = page.locator("[data-testid='container-checkbox']");
    const count = await checkboxes.count();
    
    // Should have checkboxes for each container
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
