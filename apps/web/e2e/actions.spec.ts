import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Container Actions E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("can stop a running container", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find a running container and expand it
    const runningContainer = page.locator("text=running").first();
    await runningContainer.click();
    await page.waitForTimeout(500);
    
    // Click stop button
    const stopButton = page.locator("button:has-text('Stop')").first();
    await expect(stopButton).toBeVisible();
    await stopButton.click();
    
    // Wait for action to complete
    await page.waitForTimeout(2000);
    
    // Verify container status changed to exited
    await expect(page.locator("text=exited").first()).toBeVisible({ timeout: 10000 });
  });

  test("can start a stopped container", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find an exited container (from previous test or create one)
    const exitedContainers = page.locator("text=exited");
    if (await exitedContainers.count() > 0) {
      await exitedContainers.first().click();
      await page.waitForTimeout(500);
      
      // Click start button
      const startButton = page.locator("button:has-text('Start')").first();
      await expect(startButton).toBeVisible();
      await startButton.click();
      
      // Wait for action to complete
      await page.waitForTimeout(2000);
      
      // Verify container status changed to running
      await expect(page.locator("text=running").first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("can remove a stopped container", async ({ page }) => {
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Find an exited container
    const exitedContainers = page.locator("text=exited");
    if (await exitedContainers.count() > 0) {
      const containerName = await exitedContainers.first().textContent();
      await exitedContainers.first().click();
      await page.waitForTimeout(500);
      
      // Click remove button
      const removeButton = page.locator("button:has-text('Remove')").first();
      await expect(removeButton).toBeVisible();
      
      // Handle confirmation dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await removeButton.click();
      
      // Wait for container to be removed
      await page.waitForTimeout(2000);
      
      // Verify container is no longer visible
      await expect(page.locator(`text=${containerName}`)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test("action buttons are disabled in read-only mode", async ({ page }) => {
    // Ensure edit mode is OFF
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    const isEditMode = await editButton.getAttribute('data-active');
    
    if (isEditMode) {
      await editButton.click();
      await page.waitForTimeout(500);
    }
    
    // Check that action buttons are not visible
    const stopButtons = page.locator("button:has-text('Stop')");
    await expect(stopButtons).toHaveCount(0);
    
    const startButtons = page.locator("button:has-text('Start')");
    await expect(startButtons).toHaveCount(0);
  });
});
