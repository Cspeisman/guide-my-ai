import { eq } from "drizzle-orm";
import { user } from "../auth/db-schema";
import { db } from "../db/db";
import { Mcp } from "../mcps/mcp";
import { Profile } from "../profiles/profile";
import { profiles } from "../profiles/profiles-schema";
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
  private: boolean;
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
          profile.slug,
          profile.userId,
          profile.createdAt,
          profile.updatedAt,
          profile.profilesToRules?.map(
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
          profile.profilesToMcps?.map(
            (ptm) =>
              new Mcp(
                ptm.mcp.id,
                ptm.mcp.name,
                ptm.mcp.slug,
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
      private: userRecord.private,
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
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
      private: userRecord.private,
    };
  }

  async updateUser(
    userId: string,
    updates: { name: string; private: boolean }
  ): Promise<void> {
    await db
      .update(user)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(user.id, userId));
  }

  async isUsernameTaken(
    username: string,
    excludeUserId?: string
  ): Promise<boolean> {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.name, username.toLowerCase()),
    });

    if (!existingUser) {
      return false;
    }

    // If we're checking for update, allow the current user's username
    if (excludeUserId && existingUser.id === excludeUserId) {
      return false;
    }

    return true;
  }
}
