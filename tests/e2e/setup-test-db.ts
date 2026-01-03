import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { existsSync, unlinkSync } from "fs";
import path from "path";

/**
 * Setup test database before the web server starts
 * This must run BEFORE playwright starts the web server
 */
export async function setupTestDatabase() {
  console.log("🚀 Setting up test database...");

  // Define test database path
  const testDbPath = path.join(process.cwd(), "test.sqlite");

  // Remove existing test database if it exists
  if (existsSync(testDbPath)) {
    console.log("🗑️  Removing old test database...");
    unlinkSync(testDbPath);
  }

  // Create new database and run migrations
  console.log("📦 Creating new test database...");
  const client = createClient({
    url: `file:${testDbPath}`,
  });

  // Create database instance
  const db = drizzle(client);

  // Run migrations to set up schema
  console.log("🔄 Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✅ Migrations complete");

  // Close the client to ensure database is ready
  await client.close();

  console.log("✅ Test database ready");
}

// Run if executed directly
if (import.meta.main) {
  setupTestDatabase().catch((error) => {
    console.error("❌ Failed to setup test database:", error);
    process.exit(1);
  });
}
