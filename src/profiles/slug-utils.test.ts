import { describe, expect, it } from "bun:test";
import { generateSlug, ensureUniqueSlug } from "./slug-utils";

describe("generateSlug", () => {
  it("converts name to lowercase", () => {
    expect(generateSlug("React Profile")).toBe("react-profile");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("My Awesome Profile")).toBe("my-awesome-profile");
  });

  it("replaces underscores with hyphens", () => {
    expect(generateSlug("react_native_profile")).toBe("react-native-profile");
  });

  it("removes special characters", () => {
    expect(generateSlug("React & Vue Profile!")).toBe("react-vue-profile");
  });

  it("replaces multiple consecutive hyphens with a single hyphen", () => {
    expect(generateSlug("React   Profile")).toBe("react-profile");
  });

  it("removes leading and trailing hyphens", () => {
    expect(generateSlug("  React Profile  ")).toBe("react-profile");
  });

  it("handles empty strings", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles strings with only special characters", () => {
    expect(generateSlug("!!!")).toBe("");
  });

  it("handles mixed cases", () => {
    expect(generateSlug("JavaScript & TypeScript")).toBe(
      "javascript-typescript"
    );
  });
});

describe("ensureUniqueSlug", () => {
  it("returns base slug if it doesn't exist", () => {
    expect(ensureUniqueSlug("react-profile", [])).toBe("react-profile");
  });

  it("returns base slug if no conflicts", () => {
    expect(
      ensureUniqueSlug("react-profile", ["vue-profile", "angular-profile"])
    ).toBe("react-profile");
  });

  it("appends -2 if slug already exists", () => {
    expect(ensureUniqueSlug("react-profile", ["react-profile"])).toBe(
      "react-profile-2"
    );
  });

  it("appends -3 if slug and -2 already exist", () => {
    expect(
      ensureUniqueSlug("react-profile", ["react-profile", "react-profile-2"])
    ).toBe("react-profile-3");
  });

  it("finds the next available number", () => {
    expect(
      ensureUniqueSlug("react-profile", [
        "react-profile",
        "react-profile-2",
        "react-profile-3",
      ])
    ).toBe("react-profile-4");
  });

  it("handles empty existing slugs", () => {
    expect(ensureUniqueSlug("react-profile", [])).toBe("react-profile");
  });
});
