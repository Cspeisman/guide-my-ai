import { and, eq, ne } from "drizzle-orm";
import { db } from "../db/db";
import { Profile } from "./profile";
import { profiles, profilesToMcps, profilesToRules } from "./profiles-schema";
import { Rule } from "../rules/rule";
import { Mcp } from "../mcps/mcp";
import { generateSlug, ensureUniqueSlug } from "./slug-utils";

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
          result.slug,
          result.userId,
          result.createdAt,
          result.updatedAt,
          result.profilesToRules?.map(
            (ptr) =>
              new Rule(
                ptr.rule.id,
                ptr.rule.name,
                ptr.rule.slug,
                ptr.rule.content,
                ptr.rule.createdAt,
                ptr.rule.userId
              )
          ) || [],
          result.profilesToMcps?.map(
            (ptm) =>
              new Mcp(
                ptm.mcp.id,
                ptm.mcp.name,
                ptm.mcp.context,
                ptm.mcp.createdAt,
                ptm.mcp.userId
              )
          ) || []
        )
    );
  }

  async getProfileByIdAndUserId(
    profileId: string,
    userId: string
  ): Promise<Profile | null> {
    const result = await db.query.profiles.findFirst({
      where: and(eq(profiles.id, profileId), eq(profiles.userId, userId)),
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
      result.slug,
      result.userId,
      result.createdAt,
      result.updatedAt,
      result.profilesToRules?.map(
        (ptr) =>
          new Rule(
            ptr.rule.id,
            ptr.rule.name,
            ptr.rule.slug,
            ptr.rule.content,
            ptr.rule.createdAt,
            ptr.rule.userId
          )
      ) || [],
      result.profilesToMcps?.map(
        (ptm) =>
          new Mcp(
            ptm.mcp.id,
            ptm.mcp.name,
            ptm.mcp.context,
            ptm.mcp.createdAt,
            ptm.mcp.userId
          )
      ) || []
    );
  }

  async createProfile(profile: {
    name: string;
    userId: string;
  }): Promise<Profile> {
    // Generate slug from name
    const baseSlug = generateSlug(profile.name);

    // Get existing slugs for this user to ensure uniqueness
    const existingProfiles = await db.query.profiles.findMany({
      where: eq(profiles.userId, profile.userId),
      columns: { slug: true },
    });
    const existingSlugs = existingProfiles.map((p) => p.slug);

    // Ensure unique slug
    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const [result] = await db
      .insert(profiles)
      .values({ ...profile, slug })
      .returning();
    return new Profile(
      result.id,
      result.name,
      result.slug,
      result.userId,
      result.createdAt,
      result.updatedAt,
      [],
      []
    );
  }

  async updateProfile(profile: Profile): Promise<Profile> {
    // Generate new slug if name changed
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, profile.id),
    });

    let slug = profile.slug;
    if (existingProfile && existingProfile.name !== profile.name) {
      const baseSlug = generateSlug(profile.name);

      // Get existing slugs for this user (excluding current profile)
      const existingProfiles = await db.query.profiles.findMany({
        where: and(
          eq(profiles.userId, profile.userId),
          // Exclude current profile from slug check
          ne(profiles.id, profile.id)
        ),
        columns: { slug: true },
      });
      const existingSlugs = existingProfiles.map((p) => p.slug);

      slug = ensureUniqueSlug(baseSlug, existingSlugs);
    }

    const [result] = await db
      .update(profiles)
      .set({
        name: profile.name,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id))
      .returning();

    return new Profile(
      result.id,
      result.name,
      result.slug,
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
