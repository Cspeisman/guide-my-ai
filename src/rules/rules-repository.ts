import { db } from "../db/db";
import { Rule } from "./rule";
import { rules } from "./rules-schema";
import { eq } from "drizzle-orm";

export class RulesRepository {
  async getRulesByUserId(userId: string): Promise<Rule[]> {
    const results = await db.query.rules.findMany({
      where: eq(rules.userId, userId),
      orderBy: (rules, { desc }) => [desc(rules.createdAt)],
    });
    return results.map(
      (result) =>
        new Rule(result.id, result.name, result.content, result.createdAt)
    );
  }

  async getRuleById(id: string): Promise<Rule | null> {
    const result = await db.query.rules.findFirst({
      where: eq(rules.id, id),
    });
    if (!result) {
      return null;
    }
    return new Rule(result.id, result.name, result.content, result.createdAt);
  }

  async createRule(rule: {
    name: string;
    content: string;
    userId: string;
  }): Promise<Rule> {
    const [result] = await db.insert(rules).values(rule).returning();
    return new Rule(result.id, result.name, result.content, result.createdAt);
  }

  async updateRule(rule: Rule): Promise<Rule> {
    const [result] = await db
      .update(rules)
      .set({
        name: rule.name,
        content: rule.content,
        updatedAt: new Date(),
      })
      .where(eq(rules.id, rule.id))
      .returning();
    return new Rule(result.id, result.name, result.content, result.createdAt);
  }

  async deleteRule(id: string): Promise<void> {
    await db.delete(rules).where(eq(rules.id, id));
  }
}
