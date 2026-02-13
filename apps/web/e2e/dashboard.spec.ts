import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Dashboard E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for page to load completely
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("dashboard loads with lilypad branding", async ({ page }) => {
    await expect(page).toHaveTitle(/Lilypad/);
    await expect(page.locator("text=Lilypad")).toBeVisible();
    await expect(page.locator("text=🐸")).toBeVisible();
  });

  test("displays test containers", async ({ page }) => {
    // Wait for containers to load
    await page.waitForSelector("[data-testid='container-card']", { timeout: 10000 });
    
    // Check that at least 3 test containers appear
    const containerCards = page.locator("[data-testid='container-card']");
    const count = await containerCards.count();
    
    // Should have the test containers we seeded
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Check for specific test containers
    await expect(page.locator("text=test-api-1")).toBeVisible();
    await expect(page.locator("text=test-web-1")).toBeVisible();
    await expect(page.locator("text=test-db-1")).toBeVisible();
  });

  test("stats show correct counts", async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000);
    
    // Check that stats are displayed
    await expect(page.locator("text=RUNNING")).toBeVisible();
    await expect(page.locator("text=TOTAL")).toBeVisible();
    
    // Verify total shows at least 3 (our test containers)
    const statValues = page.locator(".stat-value");
    const totalValue = await statValues.last().textContent();
    expect(parseInt(totalValue || "0")).toBeGreaterThanOrEqual(3);
  });

  test("containers have correct status indicators", async ({ page }) => {
    // Wait for containers
    await page.waitForSelector("[data-testid='container-card']", { timeout: 10000 });
    
    // Check for running indicators
    const statusDots = page.locator("[data-testid='status-dot']");
    const count = await statusDots.count();
    
    // Should have status dots for each container
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("can toggle dark mode", async ({ page }) => {
    // Check dark mode toggle exists
    const darkModeButton = page.locator("[data-testid='dark-mode-toggle']");
    await expect(darkModeButton).toBeVisible();
    
    // Click to toggle
    await darkModeButton.click();
    await page.waitForTimeout(1000);
    
    // Check page has dark mode class
    const body = page.locator("body");
    const bodyClass = await body.getAttribute("class");
    
    // Should have bp5-dark class
    expect(bodyClass).toContain("bp5-dark");
  });

  test("can expand container details in edit mode", async ({ page }) => {
    // Wait for containers
    await page.waitForSelector("[data-testid='container-card']", { timeout: 10000 });
    
    // Enable edit mode
    const editButton = page.locator("[data-testid='edit-mode-toggle']");
    await editButton.click();
    await page.waitForTimeout(500);
    
    // Click on first container to expand
    const firstContainer = page.locator("[data-testid='container-card']").first();
    await firstContainer.click();
    
    // Wait for collapse to animate
    await page.waitForTimeout(1000);
    
    // Check that details are visible
    await expect(page.locator("text=Container ID").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Image").first()).toBeVisible({ timeout: 5000 });
  });
});
