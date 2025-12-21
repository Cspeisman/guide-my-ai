// Client-side script for profile show page
// Handles delete confirmation dialog

function initDeleteConfirmation() {
  const deleteForm = document.querySelector(
    'form[data-action="delete-profile"]'
  ) as HTMLFormElement;

  if (deleteForm) {
    deleteForm.addEventListener("submit", (e) => {
      const confirmed = confirm(
        "Are you sure you want to delete this profile? This action cannot be undone."
      );

      if (!confirmed) {
        e.preventDefault();
      }
    });
  }
}

// Run immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDeleteConfirmation);
} else {
  initDeleteConfirmation();
}
