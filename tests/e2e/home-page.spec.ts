import { test, expect } from "@playwright/test";
import { login, TEST_USER } from "./helpers";

test.describe("Going to home page without auth should show sign up sign in buttons", () => {
  test("should display Sign Up and Sign In buttons on home page", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");
    // Verify the welcome heading is present
    await expect(
      page.getByRole("heading", { name: /Welcome to Guide My AI/i })
    ).toBeVisible();

    // Verify the Sign Up button is visible and has the correct link
    const signUpButton = page.getByRole("link", { name: /Sign Up/i });
    await expect(signUpButton).toBeVisible();
    await expect(signUpButton).toHaveAttribute("href", "/auth/signup");

    // Verify the Sign In button is visible and has the correct link
    const signInButton = page.getByRole("link", { name: /Sign In/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveAttribute("href", "/auth/login");
  });
});

test.describe("Login with test user", () => {
  test("should login successfully with default test user", async ({ page }) => {
    // Use the TEST_USER created in global setup
    await login(page, TEST_USER.email, TEST_USER.password);

    // Verify successful login by checking we're redirected to dashboard or profiles
    await expect(page).toHaveURL(/\/(dashboard|profiles)/);
  });
});
