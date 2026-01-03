import { FullConfig, chromium } from "@playwright/test";
import { TEST_USER } from "./constants";

/**
 * Global setup runs once before all tests
 * Use this for:
 * - Creating test users
 * - Setting up test data
 * - Authentication state preparation
 *
 * Note: Database initialization happens in setup-test-db.ts
 * which runs BEFORE the web server starts
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Running global test setup...");

  // Create test user via signup flow
  console.log("👤 Creating test user via signup flow...");
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to signup page
    await page.goto("http://localhost:3000/auth/signup", {
      waitUntil: "networkidle",
    });

    // Fill in the signup form
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Listen for response to see if signup succeeded
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/auth/signup") &&
        response.request().method() === "POST"
    );

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for the response
    const response = await responsePromise;
    console.log(`📡 Signup response status: ${response.status()}`);

    // 302 redirect is success for signup
    if (!response.ok() && response.status() !== 302) {
      let body = "Could not read response body";
      try {
        body = await response.text();
      } catch (e) {
        // Response body might not be available for redirects
      }
      console.error("❌ Signup failed with response:", body);
      throw new Error(`Signup failed with status ${response.status()}`);
    }

    // Wait for successful signup and redirect
    await page.waitForURL(/\/(dashboard|profiles)/, { timeout: 5000 });

    console.log("✅ Test user created successfully");
  } catch (error) {
    console.error("❌ Failed to create test user:", error);
    console.error("Current URL:", page.url());

    // Take a screenshot for debugging
    try {
      await page.screenshot({ path: "test-results/signup-failure.png" });
      console.log("📸 Screenshot saved to test-results/signup-failure.png");
    } catch (screenshotError) {
      // Ignore screenshot errors
    }

    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log("✅ Global setup complete");
}

export default globalSetup;
