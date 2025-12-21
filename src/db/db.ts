import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as authSchema from "../auth/db-schema";
import * as rulesSchema from "../rules/rules-schema";
import * as mcpsSchema from "../mcps/mcp-schema";
import * as profilesSchema from "../profiles/profiles-schema";

const sqlite = new Database("data.sqlite");
export const db = drizzle(sqlite, {
  schema: { ...authSchema, ...rulesSchema, ...mcpsSchema, ...profilesSchema },
});
