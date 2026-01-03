import { test as base, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers";

/**
 * Extended test fixture that provides authenticated context
 *
 * Usage:
 * import { test, expect } from "./fixtures";
 *
 * test('my authenticated test', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard');
 *   // ... test logic
 * });
 */

// Define fixture types
type AuthFixtures = {
  authenticatedPage: any;
};

// Extend base test with authentication fixture
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    // Verify successful login by checking we're redirected to dashboard or profiles
    await expect(page).toHaveURL(/\/(dashboard|profiles)/);

    await use(page);
  },
});

// Re-export expect for convenience
export { expect };
