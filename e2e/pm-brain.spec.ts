import { test, expect } from "../playwright-fixture";

test.describe("PM Brain Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/brain");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/brain");
  });

  test("renders header and navigation", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("PM Brain");
    await expect(page.getByText("Dashboard")).toBeVisible();
  });

  test("shows Reference Documents section", async ({ page }) => {
    await expect(page.getByText("Reference Documents")).toBeVisible();
    await expect(page.getByText("Upload File")).toBeVisible();
    await expect(page.getByText("Paste Text")).toBeVisible();
  });

  test("can switch between Upload and Paste tabs", async ({ page }) => {
    // Default is Upload tab
    await expect(page.getByText("Click to upload")).toBeVisible();

    // Switch to Paste tab
    await page.getByText("Paste Text").click();
    await expect(page.getByPlaceholder(/Title/)).toBeVisible();
    await expect(page.getByPlaceholder(/expertise/i)).toBeVisible();

    // Switch back to Upload
    await page.getByText("Upload File").click();
    await expect(page.getByText("Click to upload")).toBeVisible();
  });

  test("can paste and add a document", async ({ page }) => {
    await page.getByText("Paste Text").click();
    await page.getByPlaceholder(/Title/).fill("My Expertise");
    await page.getByPlaceholder(/expertise/i).fill("I have 5 years of experience in workflow automation and API design.");
    await page.getByText("Add to Brain").click();

    // Document should appear in the list
    await expect(page.getByText("My Expertise")).toBeVisible();
    await expect(page.getByText("1 doc")).toBeVisible();
  });

  test("can remove a document", async ({ page }) => {
    // Add a doc first
    await page.getByText("Paste Text").click();
    await page.getByPlaceholder(/Title/).fill("Test Doc");
    await page.getByPlaceholder(/expertise/i).fill("Some content here for testing.");
    await page.getByText("Add to Brain").click();
    await expect(page.getByText("Test Doc")).toBeVisible();

    // Remove it
    await page.locator("button").filter({ has: page.locator('[class*="lucide-trash"]') }).first().click();
    await expect(page.getByText("Test Doc")).not.toBeVisible();
  });

  test("AI Prioritization section shows top 5 label", async ({ page }) => {
    await expect(page.getByText("AI Prioritization")).toBeVisible();
    await expect(page.getByText(/top 5 features/)).toBeVisible();
  });

  test("Analyze button is disabled without documents", async ({ page }) => {
    const analyzeBtn = page.getByText("Analyze & Prioritize");
    await expect(analyzeBtn).toBeDisabled();
  });

  test("Settings section shows AI provider options", async ({ page }) => {
    await expect(page.getByText("AI Provider")).toBeVisible();
    await expect(page.getByText("Default")).toBeVisible();
    await expect(page.getByText("Claude")).toBeVisible();
    await expect(page.getByText("OpenAI")).toBeVisible();
    await expect(page.getByText("Gemini")).toBeVisible();
  });

  test("Default provider shows no API key required", async ({ page }) => {
    await expect(page.getByText("No API key required")).toBeVisible();
  });

  test("switching to Claude shows API key input", async ({ page }) => {
    await page.getByRole("button", { name: "Claude" }).click();
    await expect(page.getByPlaceholder("sk-ant-...")).toBeVisible();
  });

  test("Dashboard link navigates back", async ({ page }) => {
    await page.getByText("Dashboard").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("h1")).toHaveText("Feature Requests");
  });
});
