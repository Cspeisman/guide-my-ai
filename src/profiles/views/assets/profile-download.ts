// Client-side script for profile download
// Handles downloading profile data as separate files in a ZIP

import JSZip from "jszip";

interface ProfileData {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  mcps: Array<{
    id: number;
    name: string;
    context: string;
  }>;
  rules: Array<{
    id: number;
    name: string;
    content: string;
  }>;
}

/**
 * Generates a safe filename from a string
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, "-").toLowerCase();
}

/**
 * Downloads profile data as a ZIP file containing separate files for each rule and MCP
 */
async function downloadProfileAsZip(profileData: ProfileData) {
  const zip = new JSZip();

  // Create main profile info file (without rules and mcps content)
  const profileInfo = {
    name: profileData.name,
    createdAt: profileData.createdAt,
    updatedAt: profileData.updatedAt,
    stats: {
      mcpsCount: profileData.mcps.length,
      rulesCount: profileData.rules.length,
    },
  };

  zip.file("profile-info.json", JSON.stringify(profileInfo, null, 2));

  // Create separate files for each MCP
  if (profileData.mcps.length > 0) {
    const mcpsFolder = zip.folder("mcps");
    if (mcpsFolder) {
      profileData.mcps.forEach((mcp) => {
        const filename = `${sanitizeFilename(mcp.name)}.json`;
        mcpsFolder.file(filename, JSON.stringify(mcp, null, 2));
      });
    }
  }

  // Create separate files for each rule
  if (profileData.rules.length > 0) {
    const rulesFolder = zip.folder("rules");
    if (rulesFolder) {
      profileData.rules.forEach((rule) => {
        const filename = `${sanitizeFilename(rule.name)}.json`;
        rulesFolder.file(filename, JSON.stringify(rule, null, 2));
      });
    }
  }

  // Generate the ZIP file
  const blob = await zip.generateAsync({ type: "blob" });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const zipFilename = `${sanitizeFilename(profileData.name)}-profile.zip`;

  link.href = url;
  link.download = zipFilename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function initProfileDownload() {
  const downloadButton = document.querySelector(
    '[data-action="download-profile"]'
  ) as HTMLButtonElement;

  if (downloadButton) {
    downloadButton.addEventListener("click", async (e: MouseEvent) => {
      const button = e.currentTarget as HTMLButtonElement;
      const profileDataStr = button.getAttribute("data-profile");

      if (!profileDataStr) {
        console.error("No profile data found");
        return;
      }

      try {
        // Disable button during download
        button.disabled = true;
        const profileData: ProfileData = JSON.parse(profileDataStr);
        await downloadProfileAsZip(profileData);

        // Re-enable button
        button.disabled = false;
      } catch (error) {
        console.error("Failed to download profile:", error);
        button.disabled = false;
        alert("Failed to download profile. Please try again.");
      }
    });
  }
}

// Run immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfileDownload);
} else {
  initProfileDownload();
}
