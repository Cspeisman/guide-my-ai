export function validateSkill(data: {
  name?: string;
  description?: string;
}): { valid: boolean; error?: string } {
  const { name, description } = data;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }

  if (name.length > 64) {
    return { valid: false, error: "Name must be 64 characters or less" };
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    return {
      valid: false,
      error: "Name must contain only lowercase letters, numbers, and hyphens",
    };
  }

  // No XML tags
  if (/<[^>]+>/.test(name)) {
    return { valid: false, error: "Name must not contain XML tags" };
  }

  // No reserved words
  const reserved = ["anthropic", "claude"];
  if (reserved.some((word) => name.toLowerCase().includes(word))) {
    return { valid: false, error: "Name must not contain reserved words" };
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    return { valid: false, error: "Description is required" };
  }

  if (description.length > 1024) {
    return {
      valid: false,
      error: "Description must be 1024 characters or less",
    };
  }

  // No XML tags in description
  if (/<[^>]+>/.test(description)) {
    return { valid: false, error: "Description must not contain XML tags" };
  }

  return { valid: true };
}
