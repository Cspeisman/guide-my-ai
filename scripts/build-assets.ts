#!/usr/bin/env bun
/**
 * Build script for asset files
 * Uses Bun's built-in bundler to compile TSX files, excluding test files
 *
 * Usage:
 *   bun run scripts/build-assets.ts        # Build once
 *   bun run scripts/build-assets.ts --watch # Watch mode
 */

import { mkdir, readdir } from "fs/promises";
import { watch } from "fs";
import { join, relative, dirname, basename } from "path";

const srcDir = join(import.meta.dir, "..", "src");
const distDir = join(import.meta.dir, "..", "dist", "js");
const watchMode = process.argv.includes("--watch");

// Ensure dist directory exists
await mkdir(distDir, { recursive: true });

/**
 * Recursively find all 'assets' directories
 */
async function findAssetsDirectories(rootDir: string): Promise<string[]> {
  const assetsDirs: string[] = [];

  async function search(dir: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === "assets") {
            assetsDirs.push(fullPath);
          } else {
            // Recursively search subdirectories
            await search(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  await search(rootDir);
  return assetsDirs;
}

/**
 * Find all TSX and TS files in an assets directory
 */
async function findAssetFiles(assetsDir: string): Promise<string[]> {
  try {
    const entries = await readdir(assetsDir, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) &&
          !entry.name.endsWith(".test.tsx") &&
          !entry.name.endsWith(".test.ts")
      )
      .map((entry) => join(assetsDir, entry.name));
  } catch {
    return [];
  }
}

// Find all assets directories
const assetsDirs = await findAssetsDirectories(srcDir);

if (assetsDirs.length === 0) {
  console.warn("⚠️  No assets directories found!");
  process.exit(0);
}

// Collect all asset files (excluding test files)
const entrypoints: string[] = [];
for (const assetsDir of assetsDirs) {
  const files = await findAssetFiles(assetsDir);
  entrypoints.push(...files);
}

if (entrypoints.length === 0) {
  console.warn("⚠️  No asset files found!");
  process.exit(0);
}

/**
 * Build all asset files
 */
async function buildAssets() {
  console.log(`Building ${entrypoints.length} asset file(s)...`);

  let allSuccess = true;

  for (const entrypoint of entrypoints) {
    // Output directly to dist/js/ (completely flat)
    // e.g., "rules/assets/rule.tsx" -> "rule.js"
    const outputFilename = basename(entrypoint).replace(/\.tsx?$/, ".js");

    const result = await Bun.build({
      entrypoints: [entrypoint],
      outdir: distDir,
      minify: true,
      naming: outputFilename,
    });

    if (!result.success) {
      console.error(`❌ Build failed for ${entrypoint}:`, result.logs);
      allSuccess = false;
    }
  }

  if (!allSuccess) {
    return false;
  }

  console.log("✅ Assets built successfully!");
  console.log(`   Output: ${distDir}`);
  return true;
}

// Initial build
await buildAssets();

// Watch mode
if (watchMode) {
  console.log("\n👀 Watching for changes...");

  // Watch all assets directories for changes
  const watchers: ReturnType<typeof watch>[] = [];

  for (const assetsDir of assetsDirs) {
    const watcher = watch(
      assetsDir,
      { recursive: false },
      async (eventType, filename) => {
        // Only rebuild if it's a .tsx or .ts file (and not a test file)
        if (
          filename &&
          (filename.endsWith(".tsx") || filename.endsWith(".ts")) &&
          !filename.endsWith(".test.tsx") &&
          !filename.endsWith(".test.ts")
        ) {
          console.log(`\n📝 Detected change: ${filename}`);
          await buildAssets();
        }
      }
    );

    watchers.push(watcher);
  }

  // Keep the process alive
  process.on("SIGINT", () => {
    console.log("\n👋 Stopping watch mode...");
    for (const watcher of watchers) {
      watcher.close();
    }
    process.exit(0);
  });
}
