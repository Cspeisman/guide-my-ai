import { AppStorage, RequestContext } from "@remix-run/fetch-router";
import { describe, expect, it } from "bun:test";
import { Rule } from "./rule";
import { rulesHandlers } from "./rules-handlers";
import { RulesRepository } from "./rules-repository";
import { userIdKey } from "../auth/auth-middleware";

class FakeRulesRepository extends RulesRepository {
  rules: Rule[];

  constructor(rules: Rule[]) {
    super();
    this.rules = rules;
  }
  async getRulesByUserId(userId: string): Promise<Rule[]> {
    return this.rules;
  }
}

function createMockContext(options: { userId: string }) {
  const storage = new AppStorage();
  storage.set(userIdKey, options.userId);

  return {
    storage,
  };
}

describe("rulesHandlers.index", () => {
  it("should return HTML with rules list when user is authenticated and has rules", async () => {
    const testRules = [
      new Rule("rule1", "First Rule", "Content 1", new Date("2024-01-01")),
      new Rule("rule2", "Second Rule", "Content 2", new Date("2024-01-02")),
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
});
