import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "../auth/db-schema";
import { relations } from "drizzle-orm";

export const skills = sqliteTable(
  "skills",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull().default("Untitled Skill"),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    content: text("content").notNull().default(""),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    communityDownloads: integer("communityDownloads").notNull().default(0),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    // Ensure slug is unique per user
    unique("unique_user_skill_slug").on(table.userId, table.slug),
  ]
);

export const skillFiles = sqliteTable("skill_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  skillId: text("skillId")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  fileName: text("fileName").notNull(),
  fileContent: text("fileContent").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const skillsRelations = relations(skills, ({ one, many }) => ({
  user: one(user, {
    fields: [skills.userId],
    references: [user.id],
  }),
  files: many(skillFiles),
}));

export const skillFilesRelations = relations(skillFiles, ({ one }) => ({
  skill: one(skills, {
    fields: [skillFiles.skillId],
    references: [skills.id],
  }),
}));
