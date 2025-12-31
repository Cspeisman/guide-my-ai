import { db } from "../db/db";
import { user } from "../auth/db-schema";
import { eq, and } from "drizzle-orm";
import { profiles } from "../profiles/profiles-schema";
import { Profile } from "../profiles/profile";
import { Mcp } from "../mcps/mcp";
import { Rule } from "../rules/rule";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  githubUsername?: string | null;
  githubUrl?: string | null;
};

export class UsersRepository {
  async getProfilesByUsername(
    name: string
  ): Promise<{ userId: string; profiles: Profile[] } | null> {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.name, name.toLowerCase()),
    });
    if (!userRecord) {
      return null;
    }

    // Fetch profiles by userId
    const profileRecords = await db.query.profiles.findMany({
      where: eq(profiles.userId, userRecord.id),
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

    const userProfiles = (profileRecords ?? []).map(
      (profile) =>
        new Profile(
          profile.id,
          profile.name,
          profile.userId,
          profile.createdAt,
          profile.updatedAt,
          profile.profilesToRules?.map(
            (ptr) =>
              new Rule(
                ptr.rule.id,
                ptr.rule.name,
                ptr.rule.content,
                ptr.rule.createdAt,
                ptr.rule.userId
              )
          ) || [],
          profile.profilesToMcps?.map(
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
    // Convert to Profile instances (optional - you can return raw data if preferred)
    return { userId: userRecord.id, profiles: userProfiles };
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.name, username.toLowerCase()),
    });

    if (!userRecord) {
      return null;
    }

    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      image: userRecord.image,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt,
      githubUsername: userRecord.githubUsername,
      githubUrl: userRecord.githubUrl,
    };
  }
}
