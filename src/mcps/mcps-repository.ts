import { db } from "../db/db";
import { Mcp } from "./mcp";
import { mcps } from "./mcp-schema";
import { and, eq, ne } from "drizzle-orm";
import { generateSlug, ensureUniqueSlug } from "../profiles/slug-utils";

export class McpsRepository {
  async getMcpsByUserId(userId: string): Promise<Mcp[]> {
    const results = await db.query.mcps.findMany({
      where: eq(mcps.userId, userId),
      orderBy: (mcps, { desc }) => [desc(mcps.createdAt)],
    });
    return results.map(
      (result) =>
        new Mcp(
          result.id,
          result.name,
          result.slug,
          result.context,
          result.createdAt,
          result.userId
        )
    );
  }

  async getMcpByIdAndUserId(id: string, userId: string): Promise<Mcp | null> {
    const result = await db.query.mcps.findFirst({
      where: and(eq(mcps.id, id), eq(mcps.userId, userId)),
    });
    if (!result) {
      return null;
    }
    return new Mcp(
      result.id,
      result.name,
      result.slug,
      result.context,
      result.createdAt,
      result.userId
    );
  }

  async getMcpBySlugAndUserId(
    slug: string,
    userId: string
  ): Promise<Mcp | null> {
    const result = await db.query.mcps.findFirst({
      where: and(eq(mcps.slug, slug), eq(mcps.userId, userId)),
    });
    if (!result) {
      return null;
    }
    return new Mcp(
      result.id,
      result.name,
      result.slug,
      result.context,
      result.createdAt,
      result.userId
    );
  }

  async createMcp(mcp: {
    name: string;
    context: string;
    userId: string;
  }): Promise<Mcp> {
    // Generate slug from name
    const baseSlug = generateSlug(mcp.name);

    // Get existing slugs for this user to ensure uniqueness
    const existingMcps = await db.query.mcps.findMany({
      where: eq(mcps.userId, mcp.userId),
      columns: { slug: true },
    });
    const existingSlugs = existingMcps.map((m) => m.slug);

    // Ensure unique slug
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const [result] = await db
      .insert(mcps)
      .values({ ...mcp, slug })
      .returning();
    return new Mcp(
      result.id,
      result.name,
      result.slug,
      result.context,
      result.createdAt,
      result.userId
    );
  }

  async updateMcp(mcp: Mcp): Promise<Mcp> {
    // Generate new slug if name changed
    const existingMcp = await db.query.mcps.findFirst({
      where: eq(mcps.id, mcp.id),
    });

    let slug = mcp.slug;
    if (existingMcp && existingMcp.name !== mcp.name) {
      const baseSlug = generateSlug(mcp.name);

      // Get existing slugs for this user (excluding current mcp)
      const existingMcps = await db.query.mcps.findMany({
        where: and(
          eq(mcps.userId, mcp.userId),
          // Exclude current mcp from slug check
          ne(mcps.id, mcp.id)
        ),
        columns: { slug: true },
      });
      const existingSlugs = existingMcps.map((m) => m.slug);

      slug = ensureUniqueSlug(baseSlug, existingSlugs);
    }

    const [result] = await db
      .update(mcps)
      .set({
        name: mcp.name,
        slug,
        context: mcp.context,
        updatedAt: new Date(),
      })
      .where(eq(mcps.id, mcp.id))
      .returning();
    return new Mcp(
      result.id,
      result.name,
      result.slug,
      result.context,
      result.createdAt,
      result.userId
    );
  }

  async deleteMcp(id: string, userId: string): Promise<void> {
    await db.delete(mcps).where(and(eq(mcps.id, id), eq(mcps.userId, userId)));
  }
}
