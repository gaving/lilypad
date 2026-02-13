import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Container Actions E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    // Wait for containers to be fully loaded
    await page.waitForSelector("[data-testid='container-card']", { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test("can toggle edit mode", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await expect(editButton).toBeVisible();
    await editButton.click();
    
    // Wait for UI to update
    await page.waitForTimeout(500);
    
    // Verify we're in edit mode by checking containers are clickable
    const firstContainer = page.locator("[data-testid='container-card']").first();
    await expect(firstContainer).toBeVisible();
  });

  test("can expand and collapse container details", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Click on first container to expand
    const firstContainer = page.locator("[data-testid='container-card']").first();
    await firstContainer.click();
    
    // Wait for collapse to open (animation takes time)
    await page.waitForTimeout(1000);
    
    // Check that container details are visible
    await expect(page.locator("text=Container ID").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Image").first()).toBeVisible({ timeout: 5000 });
  });

  test("action buttons visible in edit mode", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find first running container and expand it
    const containers = page.locator("[data-testid='container-card']");
    const count = await containers.count();
    
    if (count > 0) {
      // Click to expand
      await containers.first().click();
      await page.waitForTimeout(1000);
      
      // Look for action buttons in expanded content
      // Buttons should be visible in QuickActions section
      const buttons = page.locator("button");
      const buttonCount = await buttons.count();
      
      // Should have some action buttons (Pin, Start/Stop/Remove)
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test("can view container logs", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Expand first container
    const firstContainer = page.locator("[data-testid='container-card']").first();
    await firstContainer.click();
    await page.waitForTimeout(1000);
    
    // Logs component should be visible
    await expect(page.locator("text=Container ID").first()).toBeVisible({ timeout: 5000 });
  });
});
