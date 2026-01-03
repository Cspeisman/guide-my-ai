import { Page, expect } from "@playwright/test";
import { TEST_USER } from "./constants";

/**
 * Utility functions for Playwright tests
 */

// Re-export TEST_USER for convenience
export { TEST_USER };

/**
 * Signup helper - creates a new user via the UI
 * @param page - Playwright page object
 * @param name - User name
 * @param email - User email
 * @param password - User password
 */
export async function signup(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  await page.goto("/auth/signup");
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|profiles)/);
}

/**
 * Login helper - logs in a user via the UI
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|profiles)/);
}

/**
 * Logout helper
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
  // Adjust selector based on your actual logout button/link
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL("/");
}

/**
 * Create a profile helper
 * @param page - Playwright page object
 * @param profileData - Profile data to fill in
 */
export async function createProfile(
  page: Page,
  profileData: { name: string; description?: string }
) {
  await page.goto("/profiles/new");

  await page.fill('input[name="name"]', profileData.name);
  if (profileData.description) {
    await page.fill('textarea[name="description"]', profileData.description);
  }

  await page.click('button[type="submit"]');

  // Wait for redirect to the new profile
  await page.waitForURL(/\/profiles\/.+/);
}

/**
 * Create a rule helper
 * @param page - Playwright page object
 * @param ruleData - Rule data to fill in
 */
export async function createRule(
  page: Page,
  ruleData: { title: string; content?: string }
) {
  await page.goto("/rules/new");

  await page.fill('input[name="title"]', ruleData.title);
  if (ruleData.content) {
    await page.fill('textarea[name="content"]', ruleData.content);
  }

  await page.click('button[type="submit"]');

  // Wait for redirect to the new rule
  await page.waitForURL(/\/rules\/.+/);
}

/**
 * Wait for network idle
 * @param page - Playwright page object
 */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState("networkidle");
}

/**
 * Take a screenshot with a custom name
 * @param page - Playwright page object
 * @param name - Screenshot name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png` });
}
