import { test, expect } from "../playwright-fixture";

test.describe("Dashboard — Index Page", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so we get fresh state each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  });

  test("renders the header with title and icons", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("Feature Requests");
    // Dark mode toggle, Coming Soon, Brain, Settings, Refresh icons should be present
    await expect(page.locator("header button, header a")).toHaveCount(5);
  });

  test("shows credentials empty state when no sheet is connected", async ({ page }) => {
    await expect(page.getByText("Connect your Google Sheet")).toBeVisible();
    await expect(page.getByText("Add Credentials")).toBeVisible();
  });

  test("shows onboarding cards in empty state", async ({ page }) => {
    await expect(page.getByText("Here's what you'll get")).toBeVisible();
    await expect(page.getByText("Top Features")).toBeVisible();
    await expect(page.getByText("Category View")).toBeVisible();
    await expect(page.getByText("Full Table")).toBeVisible();
    await expect(page.getByText("PM Brain")).toBeVisible();
  });

  test("opens credentials dialog when Add Credentials is clicked", async ({ page }) => {
    await page.getByText("Add Credentials").click();
    // Dialog should appear with input fields
    await expect(page.getByPlaceholder(/Spreadsheet ID/i).or(page.getByText("Spreadsheet ID"))).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    const html = page.locator("html");
    // Initially light
    await expect(html).not.toHaveClass(/dark/);

    // Click moon icon to enable dark mode
    await page.locator('button[title="Toggle dark mode"]').click();
    await expect(html).toHaveClass(/dark/);

    // Click sun icon to disable dark mode
    await page.locator('button[title="Toggle dark mode"]').click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("dark mode preference persists across reload", async ({ page }) => {
    await page.locator('button[title="Toggle dark mode"]').click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("Coming Soon hover card displays upcoming features", async ({ page }) => {
    const comingSoonBtn = page.getByText("Coming Soon");
    await expect(comingSoonBtn).toBeVisible();

    await comingSoonBtn.hover();

    // Wait for hover card to appear
    await expect(page.getByText("What's next for this tool")).toBeVisible();
    await expect(page.getByText("Trend Tracking")).toBeVisible();
    await expect(page.getByText("Client Attribution")).toBeVisible();
    await expect(page.getByText("Feature Status Tracking")).toBeVisible();
    await expect(page.getByText("Export & Share")).toBeVisible();
    await expect(page.getByText("Per-Feature Notes")).toBeVisible();
    await expect(page.getByText("Smart Alerts")).toBeVisible();
  });

  test("PM Brain link navigates to /brain", async ({ page }) => {
    await page.locator('a[title="PM Brain"]').click();
    await expect(page).toHaveURL(/\/brain/);
    await expect(page.locator("h1")).toHaveText("PM Brain");
  });

  test("Settings button opens credentials dialog", async ({ page }) => {
    await page.locator('button[title="Settings"]').click();
    await expect(page.getByPlaceholder(/Spreadsheet ID/i).or(page.getByText("Spreadsheet ID"))).toBeVisible();
  });
});
