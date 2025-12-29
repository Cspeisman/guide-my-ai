import { AppStorage } from "@remix-run/fetch-router";
import { describe, expect, it } from "bun:test";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
import { routes } from "../routes";
import { Profile } from "./profile";
import { profileHandlers } from "./profile-handlers";
import { ProfilesRepository } from "./profiles-repository";

class FakeProfilesRepository extends ProfilesRepository {
  profiles: Profile[];

  constructor(profiles: Profile[]) {
    super();
    this.profiles = profiles;
  }

  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    return this.profiles;
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const profile = this.profiles.find((p) => p.id === id);
    if (!profile) {
      return null;
    }
    return profile;
  }

  async createProfile(data: {
    name: string;
    userId: string;
  }): Promise<Profile> {
    const newProfile = new Profile(
      "new-profile-123",
      data.name,
      data.userId,
      new Date(),
      new Date(),
      [],
      []
    );
    this.profiles.push(newProfile);
    return newProfile;
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    const index = this.profiles.findIndex((p) => p.id === profile.id);
    if (index !== -1) {
      this.profiles[index] = profile;
    }
    return profile;
  }

  async updateProfileAssociations(
    profileId: string,
    ruleIds: string[],
    mcpIds: string[]
  ): Promise<void> {
    // Mock implementation
  }

  async deleteProfile(id: string): Promise<void> {
    this.profiles = this.profiles.filter((p) => p.id !== id);
  }
}

function createMockContext(options: {
  userId: string;
  params?: Record<string, string>;
  request?: Request;
}) {
  const storage = new AppStorage();
  storage.set(userIdKey, options.userId);
  storage.set(userNameKey, options.userId);

  return {
    storage,
    params: options.params,
    request: options.request,
  };
}

describe("profileHandlers", () => {
  it("should return an INDEX with profiles list when user is authenticated and has profiles", async () => {
    const testProfiles = [
      new Profile(
        "profile1",
        "Profile 1",
        "user123",
        new Date("2024-01-01"),
        new Date("2024-01-01"),
        [
          { id: "rule1", name: "Test Rule", content: "Rule content" },
          { id: "rule2", name: "Another Rule", content: "More content" },
        ],
        [
          { id: "mcp1", name: "Test MCP", context: "" },
          { id: "mcp2", name: "Another MCP", context: "" },
        ]
      ),
      new Profile(
        "profile2",
        "Profile 2",
        "user123",
        new Date("2024-01-02"),
        new Date("2024-01-02"),
        [{ id: "rule3", name: "Production Rule", content: "Prod content" }],
        []
      ),
    ];

    const fakeRepository = new FakeProfilesRepository(testProfiles);
    const handlers = profileHandlers({
      profilesRepository: fakeRepository as any,
    });

    const context = createMockContext({ userId: "user123" });
    const response = await handlers.index(context as any);

    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain("Profile 1");
    expect(html).toContain("Profile 2");
  });

  it("should a SHOW page for the profile with the url params id", async () => {
    const testProfile = new Profile(
      "profile-1",
      "Profile profile-1",
      "user123",
      new Date(),
      new Date(),
      [],
      []
    );
    const fakeRepository = new FakeProfilesRepository([testProfile]);
    const handlers = profileHandlers({
      profilesRepository: fakeRepository as any,
    });

    const context = createMockContext({
      userId: "user123",
      params: { id: "profile-1" },
    });
    const response = await handlers.show(context as any);
    const html = await response.text();
    expect(html).toContain("Profile profile-1");
  });

  it("should return a NEW page with a form to create a new profile", async () => {
    const fakeRepository = new FakeProfilesRepository([]);
    const handlers = profileHandlers({
      profilesRepository: fakeRepository as any,
    });

    const context = createMockContext({
      userId: "user123",
    });

    const response = await handlers.new(context as any);

    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain("form");
    expect(html).toContain("name");
  });

  it("should CREATE a new profile and redirect to edit page", async () => {
    const fakeRepository = new FakeProfilesRepository([]);
    const handlers = profileHandlers({
      profilesRepository: fakeRepository as any,
    });

    const formData = new FormData();
    formData.append("name", "My New Profile");

    const request = new Request("http://localhost/profiles", {
      method: "POST",
      body: formData,
    });

    const context = createMockContext({
      userId: "user123",
      request,
    });

    const response = await handlers.create(context as any);

    expect(response.status).toBe(303);
    expect(response.headers.get("Location")).toContain(
      routes.profiles.edit.href({ id: "new-profile-123" })
    );

    // Assert the repository now contains the new profile
    expect(fakeRepository.profiles).toHaveLength(1);
    expect(fakeRepository.profiles[0].id).toBe("new-profile-123");
    expect(fakeRepository.profiles[0].name).toBe("My New Profile");
    expect(fakeRepository.profiles[0].userId).toBe("user123");
  });

  describe("Authorization", () => {
    it("should prevent user from viewing another user's profile", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = profileHandlers({
        profilesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "profile-999" },
      });

      const response = await handlers.show(context as any);
      expect(response.status).toBe(403);
      const text = await response.text();
      expect(text).toContain("permission");
    });

    it("should prevent user from editing another user's profile", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = profileHandlers({
        profilesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "profile-999" },
      });

      const response = await handlers.edit(context as any);
      expect(response.status).toBe(403);
    });

    it("should prevent user from deleting another user's profile", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = profileHandlers({
        profilesRepository: fakeRepository as any,
      });

      const formData = new FormData();
      formData.append("_method", "DELETE");

      const request = new Request("http://localhost/profiles/profile-999", {
        method: "POST",
        body: formData,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "profile-999" },
        request,
      });

      const response = await handlers.destroy(context as any);
      expect(response.status).toBe(403);

      // Verify profile was not deleted
      expect(fakeRepository.profiles).toHaveLength(1);
    });

    it("should prevent user from viewing another user's profile via API", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = profileHandlers({
        profilesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "profile-999" },
      });

      const response = await handlers.api.edit.index(context as any);
      expect(response.status).toBe(403);

      const json = await response.json();
      expect(json.error).toContain("permission");
    });

    it("should prevent user from updating another user's profile via API", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = profileHandlers({
        profilesRepository: fakeRepository as any,
      });

      const request = new Request("http://localhost/api/profiles/profile-999", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Hacked Name",
          ruleIds: [],
          mcpIds: [],
        }),
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "profile-999" },
        request,
      });

      const response = await handlers.api.edit.action(context as any);
      expect(response.status).toBe(403);

      const json = await response.json();
      expect(json.error).toContain("permission");

      // Verify profile was not modified
      const profile = fakeRepository.profiles[0];
      expect(profile.name).toBe("Other User's Profile");
    });

    it("should return 404 when profile does not exist", async () => {
      const fakeRepository = new FakeProfilesRepository([]);
      const handlers = profileHandlers({
        profilesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "nonexistent-profile" },
      });

      const response = await handlers.show(context as any);
      expect(response.status).toBe(404);
    });
  });
});
