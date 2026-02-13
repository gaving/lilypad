import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Bulk Actions E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("can select multiple containers", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find checkboxes and select first two
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Select first two containers
    await checkboxes.nth(0).click();
    await page.waitForTimeout(300);
    await checkboxes.nth(1).click();
    await page.waitForTimeout(300);
    
    // Verify bulk action bar appears
    await expect(page.locator("text=2 containers selected")).toBeVisible();
  });

  test("bulk action bar shows correct count", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Select three containers
    const checkboxes = page.locator('input[type="checkbox"]');
    
    for (let i = 0; i < 3; i++) {
      await checkboxes.nth(i).click();
      await page.waitForTimeout(200);
    }
    
    // Verify count shows 3
    await expect(page.locator("text=3 containers selected")).toBeVisible();
    
    // Verify action buttons are visible
    await expect(page.locator("button:has-text('Start')")).toBeVisible();
    await expect(page.locator("button:has-text('Stop')")).toBeVisible();
    await expect(page.locator("button:has-text('Remove')")).toBeVisible();
  });

  test("can bulk stop containers", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Select two running containers
    const runningSection = page.locator("h2:has-text('running')");
    const checkboxes = runningSection.locator("..").locator('input[type="checkbox"]');
    
    if (await checkboxes.count() >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      await page.waitForTimeout(500);
      
      // Click bulk stop
      const bulkStopButton = page.locator("button:has-text('Stop')").filter({ hasText: /^Stop$/ });
      await bulkStopButton.click();
      
      // Wait for action
      await page.waitForTimeout(3000);
      
      // Verify containers moved to exited section
      await expect(page.locator("h2:has-text('exited')")).toBeVisible();
    }
  });

  test("clear button deselects all containers", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Select containers
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    await page.waitForTimeout(500);
    
    // Verify bulk bar is visible
    await expect(page.locator("text=2 containers selected")).toBeVisible();
    
    // Click clear
    const clearButton = page.locator("text=Clear");
    await clearButton.click();
    await page.waitForTimeout(500);
    
    // Verify bulk bar is hidden
    await expect(page.locator("text=2 containers selected")).not.toBeVisible();
    
    // Verify checkboxes are unchecked
    const firstCheckbox = checkboxes.nth(0);
    await expect(firstCheckbox).not.toBeChecked();
  });

  test("select all link works per section", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find and click "Select all" in running section
    const selectAllLink = page.locator("text=Select all").first();
    await selectAllLink.click();
    await page.waitForTimeout(500);
    
    // Verify bulk action bar appears with count
    const bulkBar = page.locator("text=containers selected");
    await expect(bulkBar).toBeVisible();
    
    // Get the count
    const text = await bulkBar.textContent();
    const count = parseInt(text?.match(/\d+/)?.[0] || "0");
    expect(count).toBeGreaterThan(0);
  });
});
