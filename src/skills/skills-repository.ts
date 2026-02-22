import { db } from "../db/db";
import { Skill, SkillFile } from "./skill";
import { skills, skillFiles } from "./skills-schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { generateSlug, ensureUniqueSlug } from "../profiles/slug-utils";
import { user } from "../auth/db-schema";

export class SkillsRepository {
  async getSkillsByUserId(userId: string): Promise<Skill[]> {
    const results = await db.query.skills.findMany({
      where: eq(skills.userId, userId),
      orderBy: (skills, { desc }) => [desc(skills.createdAt)],
      with: {
        files: true,
      },
    });
    return results.map(
      (result) =>
        new Skill(
          result.id,
          result.name,
          result.slug,
          result.description,
          result.content,
          result.createdAt,
          result.userId,
          result.files ?? []
        )
    );
  }

  async getSkillByIdAndUserId(
    id: string,
    userId: string
  ): Promise<Skill | null> {
    const result = await db.query.skills.findFirst({
      where: and(eq(skills.id, id), eq(skills.userId, userId)),
      with: {
        files: true,
      },
    });
    if (!result) {
      return null;
    }
    return new Skill(
      result.id,
      result.name,
      result.slug,
      result.description,
      result.content,
      result.createdAt,
      result.userId,
      result.files ?? []
    );
  }

  async getSkillBySlugAndUserId(
    slug: string,
    userId: string
  ): Promise<Skill | null> {
    const result = await db.query.skills.findFirst({
      where: and(eq(skills.slug, slug), eq(skills.userId, userId)),
      with: {
        files: true,
      },
    });
    if (!result) {
      return null;
    }
    return new Skill(
      result.id,
      result.name,
      result.slug,
      result.description,
      result.content,
      result.createdAt,
      result.userId,
      result.files ?? []
    );
  }

  async createSkill(skill: {
    name: string;
    description: string;
    content: string;
    userId: string;
  }): Promise<Skill> {
    const baseSlug = generateSlug(skill.name);

    const existingSkills = await db.query.skills.findMany({
      where: eq(skills.userId, skill.userId),
      columns: { slug: true },
    });
    const existingSlugs = existingSkills.map((s) => s.slug);

    const slug = ensureUniqueSlug(baseSlug, existingSlugs);

    const [result] = await db
      .insert(skills)
      .values({ ...skill, slug })
      .returning();
    return new Skill(
      result.id,
      result.name,
      result.slug,
      result.description,
      result.content,
      result.createdAt,
      result.userId
    );
  }

  async updateSkill(skill: Skill): Promise<Skill> {
    const existingSkill = await db.query.skills.findFirst({
      where: eq(skills.id, skill.id),
    });

    let slug = skill.slug;
    if (existingSkill && existingSkill.name !== skill.name) {
      const baseSlug = generateSlug(skill.name);

      const existingSkills = await db.query.skills.findMany({
        where: and(eq(skills.userId, skill.userId), ne(skills.id, skill.id)),
        columns: { slug: true },
      });
      const existingSlugs = existingSkills.map((s) => s.slug);

      slug = ensureUniqueSlug(baseSlug, existingSlugs);
    }

    const [result] = await db
      .update(skills)
      .set({
        name: skill.name,
        slug,
        description: skill.description,
        content: skill.content,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, skill.id))
      .returning();
    return new Skill(
      result.id,
      result.name,
      result.slug,
      result.description,
      result.content,
      result.createdAt,
      result.userId,
      skill.files
    );
  }

  async deleteSkill(id: string, userId: string): Promise<void> {
    await db
      .delete(skills)
      .where(and(eq(skills.id, id), eq(skills.userId, userId)));
  }

  async getSkillById(skillId: string): Promise<Skill | null> {
    const result = await db.query.skills.findFirst({
      where: eq(skills.id, skillId),
      with: {
        files: true,
      },
    });
    if (!result) {
      return null;
    }
    return new Skill(
      result.id,
      result.name,
      result.slug,
      result.description,
      result.content,
      result.createdAt,
      result.userId,
      result.files ?? []
    );
  }

  async incrementDownloadCount(skillId: string): Promise<void> {
    await db
      .update(skills)
      .set({
        communityDownloads: sql`${skills.communityDownloads} + 1`,
      })
      .where(eq(skills.id, skillId));
  }

  async getAllSkills(): Promise<Skill[]> {
    const results = await db
      .select({
        id: skills.id,
        name: skills.name,
        slug: skills.slug,
        description: skills.description,
        content: skills.content,
        createdAt: skills.createdAt,
        userId: skills.userId,
        userName: user.name,
        communityDownloads: skills.communityDownloads,
      })
      .from(skills)
      .innerJoin(user, eq(skills.userId, user.id))
      .where(eq(user.private, false))
      .orderBy(
        sql`${skills.communityDownloads} DESC, ${skills.createdAt} DESC`
      )
      .limit(100);

    return results.map(
      (result) =>
        new Skill(
          result.id,
          result.name,
          result.slug,
          result.description,
          result.content,
          result.createdAt,
          result.userId,
          [],
          result.userName,
          result.communityDownloads
        )
    );
  }

  // File CRUD
  async addFileToSkill(
    skillId: string,
    fileName: string,
    fileContent: string
  ): Promise<SkillFile> {
    const [result] = await db
      .insert(skillFiles)
      .values({ skillId, fileName, fileContent })
      .returning();
    return result;
  }

  async updateFile(
    fileId: string,
    updates: { fileName?: string; fileContent?: string }
  ): Promise<void> {
    await db
      .update(skillFiles)
      .set(updates)
      .where(eq(skillFiles.id, fileId));
  }

  async removeFileFromSkill(fileId: string): Promise<void> {
    await db.delete(skillFiles).where(eq(skillFiles.id, fileId));
  }

  async getFilesBySkillId(skillId: string): Promise<SkillFile[]> {
    return db.query.skillFiles.findMany({
      where: eq(skillFiles.skillId, skillId),
    });
  }
}
