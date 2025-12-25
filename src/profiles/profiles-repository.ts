import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { Profile } from "./profile";
import { profiles, profilesToMcps, profilesToRules } from "./profiles-schema";

export class ProfilesRepository {
  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    const results = await db.query.profiles.findMany({
      where: eq(profiles.userId, userId),
      orderBy: (profiles, { desc }) => [desc(profiles.createdAt)],
      with: {
        profilesToRules: {
          with: {
            rule: true,
          },
        },
        profilesToMcps: {
          with: {
            mcp: true,
          },
        },
      },
    });

    return (results ?? []).map(
      (result) =>
        new Profile(
          result.id,
          result.name,
          result.userId,
          result.createdAt,
          result.updatedAt,
          result.profilesToRules?.map((ptr) => ({
            id: ptr.rule.id,
            name: ptr.rule.name,
            content: ptr.rule.content,
          })) || [],
          result.profilesToMcps?.map((ptm) => ({
            id: ptm.mcp.id,
            name: ptm.mcp.name,
            context: ptm.mcp.context,
          })) || []
        )
    );
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const result = await db.query.profiles.findFirst({
      where: eq(profiles.id, id),
      with: {
        profilesToRules: {
          with: {
            rule: true,
          },
        },
        profilesToMcps: {
          with: {
            mcp: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return new Profile(
      result.id,
      result.name,
      result.userId,
      result.createdAt,
      result.updatedAt,
      result.profilesToRules?.map((ptr) => ({
        id: ptr.rule.id,
        name: ptr.rule.name,
        content: ptr.rule.content,
      })) || [],
      result.profilesToMcps?.map((ptm) => ({
        id: ptm.mcp.id,
        name: ptm.mcp.name,
        context: ptm.mcp.context,
      })) || []
    );
  }

  async createProfile(profile: {
    name: string;
    userId: string;
  }): Promise<Profile> {
    const [result] = await db.insert(profiles).values(profile).returning();
    return new Profile(
      result.id,
      result.name,
      result.userId,
      result.createdAt,
      result.updatedAt,
      [],
      []
    );
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    const [result] = await db
      .update(profiles)
      .set({
        name: profile.name,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id))
      .returning();

    return new Profile(
      result.id,
      result.name,
      result.userId,
      result.createdAt,
      result.updatedAt,
      profile.rules,
      profile.mcps
    );
  }

  async deleteProfile(id: string): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  async addRuleToProfile(profileId: string, ruleId: string): Promise<void> {
    await db.insert(profilesToRules).values({ profileId, ruleId });
  }

  async removeRuleFromProfile(
    profileId: string,
    ruleId: string
  ): Promise<void> {
    await db
      .delete(profilesToRules)
      .where(
        eq(profilesToRules.profileId, profileId) &&
          eq(profilesToRules.ruleId, ruleId)
      );
  }

  async addMcpToProfile(profileId: string, mcpId: string): Promise<void> {
    await db.insert(profilesToMcps).values({ profileId, mcpId });
  }

  async removeMcpFromProfile(profileId: string, mcpId: string): Promise<void> {
    await db
      .delete(profilesToMcps)
      .where(
        eq(profilesToMcps.profileId, profileId) &&
          eq(profilesToMcps.mcpId, mcpId)
      );
  }

  async updateProfileAssociations(
    profileId: string,
    ruleIds: string[],
    mcpIds: string[]
  ): Promise<void> {
    // Delete existing associations
    await db
      .delete(profilesToRules)
      .where(eq(profilesToRules.profileId, profileId));
    await db
      .delete(profilesToMcps)
      .where(eq(profilesToMcps.profileId, profileId));

    // Insert new rule associations
    if (ruleIds.length > 0) {
      await db
        .insert(profilesToRules)
        .values(ruleIds.map((ruleId) => ({ profileId, ruleId })));
    }

    // Insert new mcp associations
    if (mcpIds.length > 0) {
      await db
        .insert(profilesToMcps)
        .values(mcpIds.map((mcpId) => ({ profileId, mcpId })));
    }
  }
}
