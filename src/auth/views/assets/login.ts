import { routes } from "../../../routes";
import { authClient } from "../../auth-client";

/**
 * Client-side script for handling GitHub OAuth sign-in
 */

const githubForm = document.getElementById("github-oauth") as HTMLFormElement;

if (!githubForm) {
  console.error("GitHub OAuth form not found");
}

githubForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = githubForm.querySelector(
    "button[type='submit']"
  ) as HTMLButtonElement;

  // Disable button and show loading state
  if (button) {
    button.disabled = true;
    const originalText = button.innerHTML;
    button.innerHTML =
      '<span class="font-medium text-gray-700">Signing in...</span>';

    try {
      // Use Better Auth's social sign-in method for GitHub
      await authClient.signIn.social({
        provider: "github",
        callbackURL: routes.auth.callback.href(
          null,
          new URLSearchParams(window.location.search)
        ),
      });

      // The user will be redirected to GitHub, so we don't need to handle success here
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      button.disabled = false;
      button.innerHTML = originalText;

      // Show error message to user
      alert("Failed to sign in with GitHub. Please try again.");
    }
  }
});
