import { and, eq, ne, sql, desc, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { Profile } from "./profile";
import { profiles, profilesToMcps, profilesToRules } from "./profiles-schema";
import { Rule } from "../rules/rule";
import { Mcp } from "../mcps/mcp";
import { generateSlug, ensureUniqueSlug } from "./slug-utils";
import { user } from "../auth/db-schema";

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
          result.profilesToRules?.map((ptr) => Rule.fromPayload(ptr.rule)) ||
            [],
          result.profilesToMcps?.map((ptm) => Mcp.fromPayload(ptm.mcp)) || []
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
      result.profilesToRules?.map((ptr) => Rule.fromPayload(ptr.rule)) || [],
      result.profilesToMcps?.map((ptm) => Mcp.fromPayload(ptm.mcp)) || []
    );
  }

  async getProfileBySlugAndUserId(
    slug: string,
    userId: string
  ): Promise<Profile | null> {
    const result = await db.query.profiles.findFirst({
      where: and(eq(profiles.slug, slug), eq(profiles.userId, userId)),
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
      result.profilesToRules?.map((ptr) => Rule.fromPayload(ptr.rule)) || [],
      result.profilesToMcps?.map((ptm) => Mcp.fromPayload(ptm.mcp)) || []
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

  async getProfileById(profileId: string): Promise<Profile | null> {
    const result = await db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
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
      result.profilesToRules?.map((ptr) => Rule.fromPayload(ptr.rule)) || [],
      result.profilesToMcps?.map((ptm) => Mcp.fromPayload(ptm.mcp)) || []
    );
  }

  async incrementDownloadCount(profileId: string): Promise<void> {
    await db
      .update(profiles)
      .set({
        communityDownloads: sql`${profiles.communityDownloads} + 1`,
      })
      .where(eq(profiles.id, profileId));
  }

  async getAllProfiles(): Promise<Profile[]> {
    // First, get profiles where the associated user's private field is false
    const publicProfileRecords = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        slug: profiles.slug,
        userId: profiles.userId,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
        communityDownloads: profiles.communityDownloads,
        userName: user.name,
      })
      .from(profiles)
      .innerJoin(user, eq(profiles.userId, user.id))
      .where(eq(user.private, false))
      .orderBy(desc(profiles.createdAt))
      .limit(100); // Limit to 100 for now, can add pagination later

    if (publicProfileRecords.length === 0) {
      return [];
    }

    // Extract profile IDs to fetch full profiles with relations
    const profileIds = publicProfileRecords.map((p) => p.id);

    // Fetch full profiles with relations
    const results = await db.query.profiles.findMany({
      where: inArray(profiles.id, profileIds),
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

    // Map results maintaining the original order
    return publicProfileRecords
      .map((publicProfile) => {
        const fullProfile = results.find((r) => r.id === publicProfile.id);
        if (!fullProfile) return null;

        return new Profile(
          fullProfile.id,
          fullProfile.name,
          fullProfile.slug,
          fullProfile.userId,
          fullProfile.createdAt,
          fullProfile.updatedAt,
          fullProfile.profilesToRules?.map((ptr) =>
            Rule.fromPayload(ptr.rule)
          ) || [],
          fullProfile.profilesToMcps?.map((ptm) => Mcp.fromPayload(ptm.mcp)) ||
            [],
          publicProfile.userName,
          fullProfile.communityDownloads
        );
      })
      .filter((p): p is Profile => p !== null);
  }
}
