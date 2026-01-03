import { FullConfig } from "@playwright/test";
import { existsSync, unlinkSync } from "fs";
import path from "path";

/**
 * Global teardown runs once after all tests
 * Use this for:
 * - Cleaning up test data
 * - Closing database connections
 * - Removing temporary files
 */
async function globalTeardown(config: FullConfig) {
  console.log("🧹 Running global test teardown...");

  // Remove test database
  const testDbPath = path.join(process.cwd(), "test.sqlite");
  if (existsSync(testDbPath)) {
    console.log("🗑️  Removing test database...");
    unlinkSync(testDbPath);
  }

  console.log("✅ Global teardown complete");
}

export default globalTeardown;
