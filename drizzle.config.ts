import { defineConfig } from "drizzle-kit";

// Use Turso env vars if available, otherwise fall back to local SQLite
const databaseUrl = process.env.DATABASE_PATH || "./data.sqlite";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Check if we're using a remote libsql database (Turso)
const isRemoteDb =
  databaseUrl.startsWith("libsql://") || databaseUrl.startsWith("https://");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: isRemoteDb
    ? {
        url: databaseUrl,
        authToken: authToken!,
      }
    : {
        url: databaseUrl,
      },
});
