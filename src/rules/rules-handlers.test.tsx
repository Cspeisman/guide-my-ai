import { AppStorage, RequestContext } from "@remix-run/fetch-router";
import { describe, expect, it } from "bun:test";
import { Rule } from "./rule";
import { rulesHandlers } from "./rules-handlers";
import { RulesRepository } from "./rules-repository";
import { userIdKey, userNameKey } from "../auth/auth-middleware";

class FakeRulesRepository extends RulesRepository {
  rules: Rule[];

  constructor(rules: Rule[]) {
    super();
    this.rules = rules;
  }

  async getRulesByUserId(userId: string): Promise<Rule[]> {
    return this.rules.filter((r) => r.userId === userId);
  }

  async getRuleById(id: string): Promise<Rule | null> {
    return this.rules.find((r) => r.id === id) || null;
  }

  async createRule(data: {
    name: string;
    content: string;
    userId: string;
  }): Promise<Rule> {
    const newRule = new Rule(
      "new-rule-123",
      data.name,
      data.content,
      new Date(),
      data.userId
    );
    this.rules.push(newRule);
    return newRule;
  }

  async updateRule(rule: Rule): Promise<Rule> {
    const index = this.rules.findIndex((r) => r.id === rule.id);
    if (index !== -1) {
      this.rules[index] = rule;
    }
    return rule;
  }

  async deleteRule(id: string): Promise<void> {
    this.rules = this.rules.filter((r) => r.id !== id);
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

describe("rulesHandlers.index", () => {
  it("should return HTML with rules list when user is authenticated and has rules", async () => {
    const testRules = [
      new Rule(
        "rule1",
        "First Rule",
        "Content 1",
        new Date("2024-01-01"),
        "user123"
      ),
      new Rule(
        "rule2",
        "Second Rule",
        "Content 2",
        new Date("2024-01-02"),
        "user123"
      ),
    ];

    const fakeRepository = new FakeRulesRepository(testRules);
    const handlers = rulesHandlers({ rulesRepository: fakeRepository as any });

    const context = createMockContext({ userId: "user123" });
    const response = await handlers.index(context as any);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();
    expect(html).toContain("First Rule");
    expect(html).toContain("Second Rule");
  });

  describe("Authorization", () => {
    it("prevents user from viewing another user's rule", async () => {
      const otherUsersRule = new Rule(
        "rule-999",
        "Other User's Rule",
        "Content",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeRulesRepository([otherUsersRule]);
      const handlers = rulesHandlers({
        rulesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "rule-999" },
      });

      const response = await handlers.show(context as any);
      expect(response.status).toBe(403);
    });

    it("prevents user from viewing another user's rule via API", async () => {
      const otherUsersRule = new Rule(
        "rule-999",
        "Other User's Rule",
        "Content",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeRulesRepository([otherUsersRule]);
      const handlers = rulesHandlers({
        rulesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "rule-999" },
      });

      const response = await handlers.api.show.index(context as any);
      expect(response.status).toBe(403);
      const json = await response.json();
      expect(json.error).toContain("permission");
    });

    it("prevents user from updating another user's rule via API", async () => {
      const otherUsersRule = new Rule(
        "rule-999",
        "Other User's Rule",
        "Content",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeRulesRepository([otherUsersRule]);
      const handlers = rulesHandlers({
        rulesRepository: fakeRepository as any,
      });

      const request = new Request("http://localhost/api/rules/rule-999", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Hacked Name",
          content: "Hacked Content",
        }),
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "rule-999" },
        request,
      });

      const response = await handlers.api.show.action(context as any);
      expect(response.status).toBe(403);

      const json = await response.json();
      expect(json.error).toContain("permission");

      // Verify rule was not modified
      const rule = fakeRepository.rules[0];
      expect(rule.name).toBe("Other User's Rule");
      expect(rule.content).toBe("Content");
    });

    it("prevents user from deleting another user's rule", async () => {
      const otherUsersRule = new Rule(
        "rule-999",
        "Other User's Rule",
        "Content",
        new Date(),
        "other-user-id"
      );
      const fakeRepository = new FakeRulesRepository([otherUsersRule]);
      const handlers = rulesHandlers({
        rulesRepository: fakeRepository as any,
      });

      const formData = new FormData();
      formData.append("_method", "DELETE");

      const request = new Request("http://localhost/rules/rule-999", {
        method: "POST",
        body: formData,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "rule-999" },
        request,
      });

      const response = await handlers.destroy(context as any);
      expect(response.status).toBe(403);

      // Verify rule was not deleted
      expect(fakeRepository.rules).toHaveLength(1);
    });

    it("allows user to view their own rule", async () => {
      const usersRule = new Rule(
        "rule-123",
        "User's Rule",
        "Content",
        new Date(),
        "user123"
      );
      const fakeRepository = new FakeRulesRepository([usersRule]);
      const handlers = rulesHandlers({
        rulesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "rule-123" },
      });

      const response = await handlers.show(context as any);
      expect(response.status).toBe(200);
    });

    it("returns 404 when rule does not exist", async () => {
      const fakeRepository = new FakeRulesRepository([]);
      const handlers = rulesHandlers({
        rulesRepository: fakeRepository as any,
      });

      const context = createMockContext({
        userId: "user123",
        params: { id: "nonexistent-rule" },
      });

      const response = await handlers.show(context as any);
      expect(response.status).toBe(404);
    });
  });
});
