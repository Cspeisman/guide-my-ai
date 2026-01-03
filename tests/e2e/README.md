# Playwright E2E Testing Guide

This guide will help you write and run end-to-end tests for the Guide My AI application.

## 📁 Test Structure

```
tests/e2e/
├── example.spec.ts          # Basic test examples
├── authenticated.spec.ts    # Tests requiring authentication
├── helpers.ts               # Utility functions for tests
├── global-setup.ts          # Global setup (runs before all tests)
└── global-teardown.ts       # Global teardown (runs after all tests)
```

## 🚀 Running Tests

```bash
# Run all tests (headless)
bun run test:e2e

# Run tests in UI mode (interactive, great for debugging)
bun run test:e2e:ui

# Run tests with visible browser
bun run test:e2e:headed

# Debug mode (opens inspector)
bun run test:e2e:debug

# Run specific test file
bunx playwright test tests/e2e/example.spec.ts

# Run tests matching a pattern
bunx playwright test --grep "home page"

# View HTML report
bun run test:e2e:report
```

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
```

### Using Helpers

The test suite includes helpful utilities in `helpers.ts`:

```typescript
import { test, expect } from "@playwright/test";
import { login, signup, createProfile, TEST_USER } from "./helpers";

// Login with the default test user (created in global setup)
test("should login with test user", async ({ page }) => {
  await login(page, TEST_USER.email, TEST_USER.password);
  await expect(page).toHaveURL(/\/(dashboard|profiles)/);
});

// Create a new user via signup
test("should create new user", async ({ page }) => {
  await signup(page, "New User", "new@example.com", "password123");
  await expect(page).toHaveURL(/\/(dashboard|profiles)/);
});

// Create a profile
test("should create a profile", async ({ page }) => {
  await login(page, TEST_USER.email, TEST_USER.password);
  await createProfile(page, { name: "My Profile" });
  await expect(page).toHaveURL(/\/profiles\/.+/);
});
```

### Authenticated Tests

For tests that require authentication, use the authenticated fixture:

```typescript
import { test } from "./authenticated.spec";

test("authenticated feature", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/dashboard");
  // Test logic here
});
```

## 🔍 Common Patterns

### Waiting for Elements

```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="profile-list"]');

// Wait for URL change
await page.waitForURL("/profiles");

// Wait for network to be idle
await page.waitForLoadState("networkidle");
```

### Interacting with Elements

```typescript
// Click a button
await page.click('button[type="submit"]');

// Fill input
await page.fill('input[name="email"]', "user@example.com");

// Select dropdown option
await page.selectOption('select[name="role"]', "admin");

// Upload file
await page.setInputFiles('input[type="file"]', "path/to/file.txt");
```

### Assertions

```typescript
// Check URL
await expect(page).toHaveURL("/dashboard");

// Check element visibility
await expect(page.locator("nav")).toBeVisible();

// Check text content
await expect(page.locator("h1")).toHaveText("Welcome");

// Check element count
await expect(page.locator(".profile-item")).toHaveCount(3);
```

### Taking Screenshots

```typescript
// Screenshot for debugging
await page.screenshot({ path: "debug.png" });

// Screenshot specific element
await page.locator(".profile-card").screenshot({ path: "profile.png" });
```

## 🐛 Debugging

### UI Mode (Recommended)

The best way to debug tests is using Playwright's UI mode:

```bash
bun run test:e2e:ui
```

This opens an interactive interface where you can:

- Run tests step-by-step
- See what the page looks like at each step
- Time-travel through test execution
- Edit and re-run tests

### Debug Mode

```bash
bun run test:e2e:debug
```

This opens the Playwright Inspector with:

- Step-through execution
- Pick locator tool
- Console for running commands

### Console Logging

```typescript
test("debug test", async ({ page }) => {
  console.log(await page.title());
  console.log(await page.url());
});
```

### Pausing Tests

```typescript
test("pause test", async ({ page }) => {
  await page.goto("/");
  await page.pause(); // Test will pause here
  await page.click("button");
});
```

## 📊 Best Practices

1. **Use Data Test IDs**: Add `data-testid` attributes to important elements for stable selectors

   ```html
   <button data-testid="submit-profile">Submit</button>
   ```

   ```typescript
   await page.click('[data-testid="submit-profile"]');
   ```

2. **Independent Tests**: Each test should be independent and not rely on other tests

3. **Clean State**: Use `beforeEach` to ensure a clean state

   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset state or navigate to clean page
   });
   ```

4. **Descriptive Names**: Use clear, descriptive test names

   ```typescript
   test("should display error message when email is invalid", async ({
     page,
   }) => {
     // ...
   });
   ```

5. **Wait for Actions**: Always wait for actions to complete

   ```typescript
   await page.click("button");
   await page.waitForURL("/dashboard");
   ```

6. **Use Fixtures**: Create reusable fixtures for common setups

7. **Parallel Execution**: Tests run in parallel by default - ensure they don't conflict

## 🎯 Test Coverage

Focus on testing:

- Critical user flows (signup, login, create profile)
- Navigation between pages
- Form submissions and validation
- Authentication and authorization
- Error states
- Responsive design (different viewports)

## 🔧 Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **baseURL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 on CI, 0 locally
- **Workers**: 1 on CI, unlimited locally
- **Auto-start server**: Automatically starts dev server before tests

## 📝 CI/CD

Tests automatically run on GitHub Actions (see `.github/workflows/playwright.yml`):

- On push to main/develop
- On pull requests
- Test reports uploaded as artifacts

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)
