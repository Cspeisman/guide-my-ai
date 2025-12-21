import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as authSchema from "../auth/db-schema";
import * as rulesSchema from "../rules/rules-schema";
import * as mcpsSchema from "../mcps/mcp-schema";
import * as profilesSchema from "../profiles/profiles-schema";
import path from "path";

const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data.sqlite");

// Check if we're using a remote libsql database (Turso)
const isRemoteDb =
  dbPath.startsWith("libsql://") || dbPath.startsWith("https://");

const client = isRemoteDb
  ? createClient({
      url: dbPath,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  : createClient({
      url: `file:${dbPath}`,
    });

export const db = drizzle(client, {
  schema: { ...authSchema, ...rulesSchema, ...mcpsSchema, ...profilesSchema },
});
