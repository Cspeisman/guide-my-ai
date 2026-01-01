import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "../auth/db-schema";

export const mcps = sqliteTable(
  "mcps",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull().default("Untitled MCP"),
    slug: text("slug").notNull(),
    context: text("context").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    // Ensure slug is unique per user
    unique("unique_user_mcp_slug").on(table.userId, table.slug),
  ]
);
