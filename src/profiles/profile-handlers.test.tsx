import { AppStorage } from "@remix-run/fetch-router";
import { describe, expect, it } from "bun:test";
import { userIdKey, userNameKey } from "../auth/auth-middleware";
import { routes } from "../routes";
import { Profile } from "./profile";
import { profileHandlers } from "./profile-handlers";
import { ProfilesRepository } from "./profiles-repository";
import { RulesRepository } from "../rules/rules-repository";
import { McpsRepository } from "../mcps/mcps-repository";
import { SkillsRepository } from "../skills/skills-repository";
import { Rule } from "../rules/rule";
import { Mcp } from "../mcps/mcp";

class FakeProfilesRepository extends ProfilesRepository {
  profiles: Profile[];

  constructor(profiles: Profile[]) {
    super();
    this.profiles = profiles;
  }

  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    return this.profiles;
  }

  async getProfileByIdAndUserId(
    id: string,
    userId: string
  ): Promise<Profile | null> {
    const profile = this.profiles.find(
      (p) => p.id === id && p.userId === userId
    );
    if (!profile) {
      return null;
    }
    return profile;
  }

  async getProfileBySlugAndUserId(
    slug: string,
    userId: string
  ): Promise<Profile | null> {
    const profile = this.profiles.find(
      (p) => p.slug === slug && p.userId === userId
    );
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
      "my-new-profile",
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

  async getProfileById(profileId: string): Promise<Profile | null> {
    const profile = this.profiles.find((p) => p.id === profileId);
    return profile || null;
  }

  incrementDownloadCountCalls: string[] = [];

  async incrementDownloadCount(profileId: string): Promise<void> {
    this.incrementDownloadCountCalls.push(profileId);
  }
}

class FakeRulesRepository extends RulesRepository {
  incrementDownloadCountCalls: string[] = [];

  async incrementDownloadCount(ruleId: string): Promise<void> {
    this.incrementDownloadCountCalls.push(ruleId);
  }
}

class FakeMcpsRepository extends McpsRepository {
  incrementDownloadCountCalls: string[] = [];

  async incrementDownloadCount(mcpId: string): Promise<void> {
    this.incrementDownloadCountCalls.push(mcpId);
  }
}

class FakeSkillsRepository extends SkillsRepository {
  incrementDownloadCountCalls: string[] = [];

  async incrementDownloadCount(skillId: string): Promise<void> {
    this.incrementDownloadCountCalls.push(skillId);
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

function createHandlers(profilesRepository: FakeProfilesRepository) {
  return profileHandlers({
    profilesRepository: profilesRepository as any,
    rulesRepository: new FakeRulesRepository() as any,
    mcpsRepository: new FakeMcpsRepository() as any,
    skillsRepository: new FakeSkillsRepository() as any,
  });
}

describe("profileHandlers", () => {
  it("should return an INDEX with profiles list when user is authenticated and has profiles", async () => {
    const testProfiles = [
      new Profile(
        "profile1",
        "Profile 1",
        "profile-1",
        "user123",
        new Date("2024-01-01"),
        new Date("2024-01-01"),
        [
          new Rule(
            "rule1",
            "Test Rule",
            "test-rule",
            "Rule content",
            new Date("2024-01-01"),
            "user123"
          ),
          new Rule(
            "rule2",
            "Another Rule",
            "another-rule",
            "More content",
            new Date("2024-01-01"),
            "user123"
          ),
        ],
        [
          new Mcp(
            "mcp1",
            "Test MCP",
            "test-mcp",
            "",
            new Date("2024-01-01"),
            "user123"
          ),
          new Mcp(
            "mcp2",
            "Another MCP",
            "another-mcp",
            "",
            new Date("2024-01-01"),
            "user123"
          ),
        ]
      ),
      new Profile(
        "profile2",
        "Profile 2",
        "profile-2",
        "user123",
        new Date("2024-01-02"),
        new Date("2024-01-02"),
        [
          new Rule(
            "rule3",
            "Production Rule",
            "production-rule",
            "Prod content",
            new Date("2024-01-02"),
            "user123"
          ),
        ],
        []
      ),
    ];

    const fakeRepository = new FakeProfilesRepository(testProfiles);
    const handlers = createHandlers(fakeRepository);

    const context = createMockContext({ userId: "user123" });
    const response = await handlers.index(context as any);

    expect(response.status).toBe(200);

    const html = await response.text();
    expect(html).toContain("Profile 1");
    expect(html).toContain("Profile 2");
  });

  it("renders a SHOW page for the profile with matching slug", async () => {
    const testProfile = new Profile(
      "profile-1",
      "Profile profile-1",
      "profile-profile-1",
      "user123",
      new Date(),
      new Date(),
      [],
      []
    );
    const fakeRepository = new FakeProfilesRepository([testProfile]);
    const handlers = createHandlers(fakeRepository);

    const context = createMockContext({
      userId: "user123",
      params: { slug: "profile-profile-1" },
    });
    const response = await handlers.show(context as any);
    const html = await response.text();
    expect(html).toContain("Profile profile-1");
  });

  it("should return a NEW page with a form to create a new profile", async () => {
    const fakeRepository = new FakeProfilesRepository([]);
    const handlers = createHandlers(fakeRepository);

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
    const handlers = createHandlers(fakeRepository);

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
      routes.profiles.edit.href({ slug: "my-new-profile" })
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
        "other-users-profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = createHandlers(fakeRepository);

      const context = createMockContext({
        userId: "user456",
        params: { slug: "profile-999" },
      });

      const response = await handlers.show(context as any);

      const text = await response.text();
      expect(text).toContain("Sorry we were unable to find profile with ID");
    });

    it("should prevent user from deleting another user's profile", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-users-profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = createHandlers(fakeRepository);

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
      const text = await response.text();
      expect(text).toContain("Sorry we were unable to find profile with ID");

      // Verify profile was not deleted
      expect(fakeRepository.profiles).toHaveLength(1);
    });

    it("should prevent user from viewing another user's profile via API", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-users-profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = createHandlers(fakeRepository);

      const context = createMockContext({
        userId: "user123",
        params: { id: "profile-999" },
      });

      const response = await handlers.api.edit.index(context as any);
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json.msg).toBe("unable to find the resource for current user");
    });

    it("should prevent user from updating another user's profile via API", async () => {
      const otherUsersProfile = new Profile(
        "profile-999",
        "Other User's Profile",
        "other-users-profile",
        "other-user-id",
        new Date(),
        new Date(),
        [],
        []
      );
      const fakeRepository = new FakeProfilesRepository([otherUsersProfile]);
      const handlers = createHandlers(fakeRepository);

      const request = new Request("http://localhost/api/profiles/profile-999", {
        method: "POST",
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
      expect(response.status).toBe(404);

      // Verify profile was not modified
      const profile = fakeRepository.profiles[0];
      expect(profile.name).toBe("Other User's Profile");
    });
  });

  describe("incrementDownloadCount", () => {
    it("increments download count when user is NOT the profile owner, but does not increment when user IS the owner", async () => {
      const testRule1 = new Rule(
        "rule-1",
        "Test Rule 1",
        "test-rule-1",
        "Rule content 1",
        new Date(),
        "owner-user-id"
      );
      const testRule2 = new Rule(
        "rule-2",
        "Test Rule 2",
        "test-rule-2",
        "Rule content 2",
        new Date(),
        "owner-user-id"
      );
      const testMcp1 = new Mcp(
        "mcp-1",
        "Test MCP 1",
        "test-mcp-1",
        "MCP context 1",
        new Date(),
        "owner-user-id"
      );
      const testProfile = new Profile(
        "profile-123",
        "Test Profile",
        "test-profile",
        "owner-user-id",
        new Date(),
        new Date(),
        [testRule1, testRule2],
        [testMcp1]
      );

      const fakeProfilesRepository = new FakeProfilesRepository([testProfile]);
      const fakeRulesRepository = new FakeRulesRepository();
      const fakeMcpsRepository = new FakeMcpsRepository();
      const fakeSkillsRepository = new FakeSkillsRepository();

      const handlers = profileHandlers({
        profilesRepository: fakeProfilesRepository as any,
        rulesRepository: fakeRulesRepository as any,
        mcpsRepository: fakeMcpsRepository as any,
        skillsRepository: fakeSkillsRepository as any,
      });

      // Case 1: Different user (not the owner) - should increment profile, rules, and mcps
      const differentUserContext = createMockContext({
        userId: "different-user-id",
        params: { id: "profile-123" },
      });

      const response1 = await handlers.api.incrementDownloadCount(
        differentUserContext as any
      );
      expect(response1.status).toBe(200);
      const json1 = await response1.json();
      expect(json1.success).toBe(true);

      // Check profile download count was incremented
      expect(fakeProfilesRepository.incrementDownloadCountCalls).toHaveLength(
        1
      );
      expect(fakeProfilesRepository.incrementDownloadCountCalls[0]).toBe(
        "profile-123"
      );

      // Check rules download counts were incremented
      expect(fakeRulesRepository.incrementDownloadCountCalls).toHaveLength(2);
      expect(fakeRulesRepository.incrementDownloadCountCalls).toContain(
        "rule-1"
      );
      expect(fakeRulesRepository.incrementDownloadCountCalls).toContain(
        "rule-2"
      );

      // Check mcps download counts were incremented
      expect(fakeMcpsRepository.incrementDownloadCountCalls).toHaveLength(1);
      expect(fakeMcpsRepository.incrementDownloadCountCalls[0]).toBe("mcp-1");

      // Case 2: Same user (the owner) - should NOT increment
      const ownerUserContext = createMockContext({
        userId: "owner-user-id",
        params: { id: "profile-123" },
      });

      const response2 = await handlers.api.incrementDownloadCount(
        ownerUserContext as any
      );
      expect(response2.status).toBe(200);
      const json2 = await response2.json();
      expect(json2.success).toBe(true);

      // Verify counts remain unchanged (still 1 profile, 2 rules, 1 mcp)
      expect(fakeProfilesRepository.incrementDownloadCountCalls).toHaveLength(
        1
      );
      expect(fakeRulesRepository.incrementDownloadCountCalls).toHaveLength(2);
      expect(fakeMcpsRepository.incrementDownloadCountCalls).toHaveLength(1);
    });
  });
});
