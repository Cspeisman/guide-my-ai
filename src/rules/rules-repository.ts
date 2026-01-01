import { db } from "../db/db";
import { Rule } from "./rule";
import { rules } from "./rules-schema";
import { eq, and, ne } from "drizzle-orm";
import { generateSlug, ensureUniqueSlug } from "../profiles/slug-utils";

export class RulesRepository {
  async getRulesByUserId(userId: string): Promise<Rule[]> {
    const results = await db.query.rules.findMany({
      where: eq(rules.userId, userId),
      orderBy: (rules, { desc }) => [desc(rules.createdAt)],
    });
    return results.map(
      (result) =>
        new Rule(
          result.id,
          result.name,
          result.slug,
          result.content,
          result.createdAt,
          result.userId
        )
    );
  }

  async getRuleByIdAndUserId(
    ruleId: string,
    userId: string
  ): Promise<Rule | null> {
    const result = await db.query.rules.findFirst({
      where: and(eq(rules.id, ruleId), eq(rules.userId, userId)),
    });
    if (!result) {
      return null;
    }
    return new Rule(
      result.id,
      result.name,
      result.slug,
      result.content,
      result.createdAt,
      result.userId
    );
  }

  async createRule(rule: {
    name: string;
    content: string;
    userId: string;
  }): Promise<Rule> {
    // Generate slug from name
    const baseSlug = generateSlug(rule.name);

    // Get existing slugs for this user to ensure uniqueness
    const existingRules = await db.query.rules.findMany({
      where: eq(rules.userId, rule.userId),
      columns: { slug: true },
    });
    const existingSlugs = existingRules.map((r) => r.slug);

    // Ensure unique slug
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const [result] = await db
      .insert(rules)
      .values({ ...rule, slug })
      .returning();
    return new Rule(
      result.id,
      result.name,
      result.slug,
      result.content,
      result.createdAt,
      result.userId
    );
  }

  async updateRule(rule: Rule): Promise<Rule> {
    // Generate new slug if name changed
    const existingRule = await db.query.rules.findFirst({
      where: eq(rules.id, rule.id),
    });

    let slug = rule.slug;
    if (existingRule && existingRule.name !== rule.name) {
      const baseSlug = generateSlug(rule.name);

      // Get existing slugs for this user (excluding current rule)
      const existingRules = await db.query.rules.findMany({
        where: and(
          eq(rules.userId, rule.userId),
          // Exclude current rule from slug check
          ne(rules.id, rule.id)
        ),
        columns: { slug: true },
      });
      const existingSlugs = existingRules.map((r) => r.slug);

      slug = ensureUniqueSlug(baseSlug, existingSlugs);
    }

    const [result] = await db
      .update(rules)
      .set({
        name: rule.name,
        slug,
        content: rule.content,
        updatedAt: new Date(),
      })
      .where(and(eq(rules.id, rule.id), eq(rules.userId, rule.userId)))
      .returning();
    return new Rule(
      result.id,
      result.name,
      result.slug,
      result.content,
      result.createdAt,
      result.userId
    );
  }

  async deleteRule(id: string, userId: string): Promise<void> {
    await db
      .delete(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, userId)));
  }
}
