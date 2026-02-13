import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("dashboard loads with lilypad branding", async ({ page }) => {
    await expect(page).toHaveTitle(/Lilypad/);
    await expect(page.locator("text=Lilypad")).toBeVisible();
    await expect(page.locator("text=🐸")).toBeVisible();
  });

  test("displays test containers", async ({ page }) => {
    // Wait for containers to load
    await page.waitForTimeout(3000);
    
    // Check that at least 3 test containers appear
    const containerCards = page.locator("[data-testid='container-card']");
    await expect(containerCards).toHaveCount(3, { timeout: 10000 });
    
    // Check for specific test containers
    await expect(page.locator("text=test-api-1")).toBeVisible();
    await expect(page.locator("text=test-web-1")).toBeVisible();
    await expect(page.locator("text=test-db-1")).toBeVisible();
  });

  test("stats show correct counts", async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check that stats are displayed
    await expect(page.locator("text=RUNNING")).toBeVisible();
    await expect(page.locator("text=TOTAL")).toBeVisible();
    
    // Verify total shows at least 3
    const totalValue = await page.locator(".stat-value").last().textContent();
    expect(parseInt(totalValue || "0")).toBeGreaterThanOrEqual(3);
  });

  test("containers have correct status indicators", async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Check for running indicators
    const runningContainers = page.locator("text=running");
    await expect(runningContainers.first()).toBeVisible();
    
    // Check for status dots
    const statusDots = page.locator("[data-testid='status-dot']");
    await expect(statusDots.first()).toBeVisible();
  });

  test("can expand container details", async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Enable edit mode first
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Click on first container to expand
    const firstContainer = page.locator("[data-testid='container-card']").first();
    await firstContainer.click();
    await page.waitForTimeout(500);
    
    // Check that details are visible
    await expect(page.locator("text=Container ID")).toBeVisible();
    await expect(page.locator("text=Image")).toBeVisible();
  });
});
