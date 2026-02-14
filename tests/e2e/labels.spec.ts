import { test, expect } from "@playwright/test";

const BASE_URL = process.env.LILYPAD_URL || "http://localhost:8888";

test.describe("Container Labels", () => {
  test("labels section appears when container is expanded", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Enter edit mode
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);

    // Expand the first container
    const expandButton = page.locator('[data-testid="expand-container"]').first();
    await expandButton.click();
    await page.waitForTimeout(1000);

    // Verify labels section is visible
    await expect(page.locator('[data-testid="labels-section"]')).toBeVisible();
  });

  test("Lilypad labels are displayed as badges", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Enter edit mode
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);

    // Expand the first container
    const expandButton = page.locator('[data-testid="expand-container"]').first();
    await expandButton.click();
    await page.waitForTimeout(1000);

    // Verify Lilypad labels section exists
    await expect(page.locator('text=Lilypad Labels')).toBeVisible();

    // Verify at least one Lilypad label badge is visible
    const lilypadBadges = page.locator('[data-testid="lilypad-label-badge"]');
    await expect(lilypadBadges.first()).toBeVisible();
  });

  test("Docker labels are displayed as a list", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Enter edit mode
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);

    // Expand the first container
    const expandButton = page.locator('[data-testid="expand-container"]').first();
    await expandButton.click();
    await page.waitForTimeout(1000);

    // Check for Docker labels section (only if Docker labels exist)
    const dockerLabelsHeading = page.locator('text=Docker Labels');
    const count = await dockerLabelsHeading.count();

    if (count > 0) {
      await expect(dockerLabelsHeading).toBeVisible();

      // Verify Docker label rows exist
      const dockerLabelRows = page.locator('[data-testid="docker-label-row"]');
      await expect(dockerLabelRows.first()).toBeVisible();
    }
  });

  test("long label values can be expanded", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Enter edit mode
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);

    // Expand the first container
    const expandButton = page.locator('[data-testid="expand-container"]').first();
    await expandButton.click();
    await page.waitForTimeout(1000);

    // Check for expand buttons on long labels
    const expandButtons = page.locator('[data-testid="expand-label-button"]');
    const count = await expandButtons.count();

    if (count > 0) {
      // Click the first expand button
      await expandButtons.first().click();
      await page.waitForTimeout(500);

      // Verify button text changed to 'less'
      await expect(expandButtons.first()).toHaveText('less');

      // Click again to collapse
      await expandButtons.first().click();
      await page.waitForTimeout(500);

      // Verify button text changed back to 'more'
      await expect(expandButtons.first()).toHaveText('more');
    }
  });

  test("container details include ID and Image", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);

    // Enter edit mode
    const editButton = page.locator('[data-testid="edit-mode-toggle"]');
    await editButton.click();
    await page.waitForTimeout(1000);

    // Expand the first container
    const expandButton = page.locator('[data-testid="expand-container"]').first();
    await expandButton.click();
    await page.waitForTimeout(1000);

    // Verify Container ID is shown
    await expect(page.locator('text=Container ID')).toBeVisible();

    // Verify Image is shown
    await expect(page.locator('text=Image')).toBeVisible();

    // Verify Status is shown
    await expect(page.locator('text=Status').first()).toBeVisible();
  });
});
