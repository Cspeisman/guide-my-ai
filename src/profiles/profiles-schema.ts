import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  unique,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { user } from "../auth/db-schema";
import { rules } from "../rules/rules-schema";
import { mcps } from "../mcps/mcp-schema";

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull().default("Untitled Profile"),
    slug: text("slug").notNull(),
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
    unique("unique_user_slug").on(table.userId, table.slug),
  ]
);

// Junction table for profiles-rules many-to-many relationship
export const profilesToRules = sqliteTable(
  "profiles_to_rules",
  {
    profileId: text("profileId")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    ruleId: text("ruleId")
      .notNull()
      .references(() => rules.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.ruleId] })]
);

// Junction table for profiles-mcps many-to-many relationship
export const profilesToMcps = sqliteTable(
  "profiles_to_mcps",
  {
    profileId: text("profileId")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    mcpId: text("mcpId")
      .notNull()
      .references(() => mcps.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.mcpId] })]
);

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  profilesToRules: many(profilesToRules),
  profilesToMcps: many(profilesToMcps),
}));

export const profilesToRulesRelations = relations(
  profilesToRules,
  ({ one }) => ({
    profile: one(profiles, {
      fields: [profilesToRules.profileId],
      references: [profiles.id],
    }),
    rule: one(rules, {
      fields: [profilesToRules.ruleId],
      references: [rules.id],
    }),
  })
);

export const profilesToMcpsRelations = relations(profilesToMcps, ({ one }) => ({
  profile: one(profiles, {
    fields: [profilesToMcps.profileId],
    references: [profiles.id],
  }),
  mcp: one(mcps, {
    fields: [profilesToMcps.mcpId],
    references: [mcps.id],
  }),
}));
