"use strict";

const fs = require("fs-extra");
const path = require("path");

/**
 * Reset database and clean up temporary files
 * This script helps resolve schema validation issues
 */

async function resetDatabase() {
  try {
    console.log("🔄 Resetting database...");

    // Remove temporary database files
    const tmpDir = path.join(process.cwd(), ".tmp");
    if (fs.existsSync(tmpDir)) {
      console.log("Removing .tmp directory...");
      await fs.remove(tmpDir);
    }

    // Remove build artifacts
    const distDir = path.join(process.cwd(), "dist");
    if (fs.existsSync(distDir)) {
      console.log("Removing dist directory...");
      await fs.remove(distDir);
    }

    // Remove node_modules/.cache if exists
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache");
    if (fs.existsSync(cacheDir)) {
      console.log("Removing node_modules/.cache directory...");
      await fs.remove(cacheDir);
    }

    console.log("✅ Database reset completed!");
    console.log("");
    console.log("📋 Next steps:");
    console.log("1. Start Strapi: npm run develop");
    console.log("2. Create admin user in browser");
    console.log("3. Run: npm run setup:permissions");
    console.log("4. Run: npm run seed:foliage-spots");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

// Check if we're running this script directly
if (require.main === module) {
  resetDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { resetDatabase };
