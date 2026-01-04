export function initUserSettingsDialog() {
  const openButton = document.getElementById("open-user-settings");
  const closeButton = document.getElementById("close-user-settings");
  const dialog = document.getElementById(
    "user-settings-dialog"
  ) as HTMLDialogElement;

  if (openButton && dialog) {
    openButton.addEventListener("click", () => {
      dialog.showModal();
    });
  }

  if (closeButton && dialog) {
    closeButton.addEventListener("click", () => {
      dialog.close();
    });
  }

  // Close dialog when clicking outside of it
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      const dialogDimensions = dialog.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        dialog.close();
      }
    });
  }

  // Close dialog when clicking anywhere outside
  document.addEventListener("click", (e) => {
    if (
      dialog &&
      dialog.open &&
      !dialog.contains(e.target as Node) &&
      !openButton?.contains(e.target as Node)
    ) {
      dialog.close();
    }
  });
}

initUserSettingsDialog();
