import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as authSchema from "../auth/db-schema";
import * as rulesSchema from "../rules/rules-schema";
import * as mcpsSchema from "../mcps/mcp-schema";
import * as profilesSchema from "../profiles/profiles-schema";
import path from "path";

const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data.sqlite");
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, {
  schema: { ...authSchema, ...rulesSchema, ...mcpsSchema, ...profilesSchema },
});
