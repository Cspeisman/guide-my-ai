import { test, expect } from "./fixtures";

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
  test("authenticated users should be redirected to dashboard", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/");

    // Verify the user is redirected to dashboard
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);

    // Verify the Dashboard heading is visible
    await expect(
      authenticatedPage.getByRole("heading", { level: 1, name: /Dashboard/i })
    ).toBeVisible();
  });
});
