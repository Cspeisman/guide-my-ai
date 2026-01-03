import { test, expect } from "./fixtures";

test.describe("rules", () => {
  test.describe.serial("rule lifecycle", () => {
    test("should create and view a rule", async ({
      authenticatedPage: page,
    }) => {
      await page.goto("/rules");

      // Assert that the "Create Rule" button is visible in the empty state
      const createRuleButton = page.getByRole("link", {
        name: "Create Rule",
      });

      await expect(createRuleButton).toBeVisible();

      // Click the "Create Rule" button
      await createRuleButton.click();

      // Verify navigation to the new rule form page
      await expect(page).toHaveURL("/rules/new");

      // Verify the form elements are present
      await expect(
        page.getByRole("heading", { name: "Create New Rule" })
      ).toBeVisible();

      // Fill in the form
      await page.getByLabel("Rule Name").fill("Test Rule");
      await page.getByLabel("Content").fill("my new rules to use as a test");

      // Submit the form
      await page.getByRole("button", { name: "Create Rule" }).click();

      // Verify that the rule was created and we're redirected to the rules list
      await expect(page).toHaveURL("/rules");

      // Verify the new rule appears in the list
      await expect(
        page.getByRole("heading", { name: "Test Rule" })
      ).toBeVisible();
    });

    test("it should edit a created rule", async ({
      authenticatedPage: page,
    }) => {
      // Navigate to rules list
      await page.goto("/rules");

      // Click on the "Test Rule" created in the previous test
      const ruleCard = page.getByRole("link", { name: /Test Rule/ });
      await expect(ruleCard).toBeVisible();
      await ruleCard.click();

      // Verify we're on the rule detail page
      await expect(page).toHaveURL("/rules/test-rule");

      // Wait for the loading spinner to disappear (indicates React has rendered)
      await expect(page.getByText("Loading rule...")).not.toBeVisible({
        timeout: 10000,
      });

      // Wait for the Name label to be visible (indicates the form is loaded)
      await expect(page.getByText("Name")).toBeVisible();

      // Find and click the name field to edit it
      const nameField = page.getByText("Test Rule").first();
      await expect(nameField).toBeVisible();
      await nameField.click();

      // Wait for the input field to appear and edit it
      const nameInput = page.locator('input[type="text"]');
      await expect(nameInput).toBeVisible();
      await nameInput.fill("Updated Test Rule");

      // Save by blurring the input (clicking outside)
      await page.click("body");

      // Wait for the save to complete and verify the updated name is displayed
      await page.waitForTimeout(500); // Give time for the API call to complete
      const updatedNameField = page.getByText("Updated Test Rule").first();
      await expect(updatedNameField).toBeVisible();

      // Navigate back to rules list to verify the change persisted
      await page.goto("/rules");

      // Verify the rule name was updated in the list
      await expect(
        page.getByRole("heading", { name: "Updated Test Rule" })
      ).toBeVisible();
    });
  });
});
