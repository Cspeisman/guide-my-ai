import { test as base, expect } from "@playwright/test";

/**
 * Extended test fixture that provides authenticated context
 *
 * Usage:
 * test('my authenticated test', async ({ page, authenticatedPage }) => {
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
    // TODO: Implement authentication logic here
    // This is a placeholder - adjust based on your authentication mechanism

    // Option 1: Login via UI
    // await page.goto('/auth/login');
    // await page.fill('input[type="email"]', 'test@example.com');
    // await page.fill('input[type="password"]', 'password123');
    // await page.click('button[type="submit"]');
    // await page.waitForURL('/dashboard'); // or wherever login redirects

    // Option 2: Set authentication state directly (faster)
    // await page.context().addCookies([
    //   { name: 'auth_token', value: 'your-token', domain: 'localhost', path: '/' }
    // ]);

    // Option 3: Use API to get token and set it
    // const token = await getAuthToken();
    // await page.context().addCookies([...]);

    await use(page);
  },
});
