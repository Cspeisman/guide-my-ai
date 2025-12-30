import { db } from "../db/db";
import { Mcp } from "./mcp";
import { mcps } from "./mcp-schema";
import { and, eq } from "drizzle-orm";

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
    const [result] = await db.insert(mcps).values(mcp).returning();
    return new Mcp(
      result.id,
      result.name,
      result.context,
      result.createdAt,
      result.userId
    );
  }

  async updateMcp(mcp: Mcp): Promise<Mcp> {
    const [result] = await db
      .update(mcps)
      .set({
        name: mcp.name,
        context: mcp.context,
        updatedAt: new Date(),
      })
      .where(eq(mcps.id, mcp.id))
      .returning();
    return new Mcp(
      result.id,
      result.name,
      result.context,
      result.createdAt,
      result.userId
    );
  }

  async deleteMcp(id: string, userId: string): Promise<void> {
    await db.delete(mcps).where(and(eq(mcps.id, id), eq(mcps.userId, userId)));
  }
}
