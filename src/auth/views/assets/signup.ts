// Client-side JavaScript for signup form
import { routes } from "../../../routes";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm") as HTMLFormElement;
  const errorDiv = document.getElementById("error") as HTMLDivElement;
  const successDiv = document.getElementById("success") as HTMLDivElement;

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Hide previous messages
    errorDiv.classList.add("hidden");
    successDiv.classList.add("hidden");

    const formData = new FormData(form);
    const submitButton = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    // Disable submit button during request
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Signing up...";
    }

    try {
      const response = await fetch(routes.auth.signup.action.href(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "An error occurred" }));
        throw new Error(error.message || "Signup failed");
      }

      const result = await response.json();

      // Show success message
      successDiv.textContent =
        result.message || "Account created successfully!";
      successDiv.classList.remove("hidden");

      // Reset form
      form.reset();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = routes.auth.login.index.href();
      }, 2000);
    } catch (error) {
      // Show error message
      errorDiv.textContent =
        error instanceof Error
          ? error.message
          : "An error occurred during signup";
      errorDiv.classList.remove("hidden");
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Sign Up";
      }
    }
  });
});
