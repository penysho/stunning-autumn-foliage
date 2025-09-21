"use strict";

/**
 * Validate foliage-spot schema and data integrity
 */

async function validateSchema() {
  try {
    console.log("🔍 Validating foliage-spot schema and data...");
    console.log("");

    // Get the content type definition
    const contentType = strapi.contentTypes["api::foliage-spot.foliage-spot"];

    if (!contentType) {
      console.error("❌ Foliage-spot content type not found!");
      return;
    }

    console.log("✅ Content type found:");
    console.log(`   - Model: ${contentType.modelName}`);
    console.log(`   - Collection: ${contentType.collectionName}`);
    console.log("");

    // Check status enum definition
    const statusAttribute = contentType.attributes.status;
    if (statusAttribute && statusAttribute.type === "enumeration") {
      console.log("✅ Status enumeration found:");
      console.log(`   - Enum values: ${statusAttribute.enum.join(", ")}`);
      console.log(`   - Default: ${statusAttribute.default}`);
      console.log(`   - Required: ${statusAttribute.required}`);
    } else {
      console.error("❌ Status enumeration not properly defined!");
    }
    console.log("");

    // Test database connection and existing data
    try {
      const existingSpots = await strapi
        .documents("api::foliage-spot.foliage-spot")
        .findMany({
          populate: ["image"],
        });

      console.log(`📊 Found ${existingSpots.length} existing foliage spots:`);

      existingSpots.forEach((spot, index) => {
        console.log(
          `   ${index + 1}. "${spot.name}" - Status: "${spot.status}"`
        );

        // Check if status is valid
        if (!statusAttribute.enum.includes(spot.status)) {
          console.error(`      ❌ Invalid status: "${spot.status}"`);
        }
      });
    } catch (error) {
      console.error("❌ Error querying existing data:", error.message);
    }
    console.log("");

    // Test creating a record with valid status
    console.log("🧪 Testing record creation with valid status...");
    try {
      const testSpot = await strapi
        .documents("api::foliage-spot.foliage-spot")
        .create({
          data: {
            name: "Test Spot - " + Date.now(),
            status: "colored",
            description: "Test description",
            latitude: 39.0,
            longitude: 140.0,
            featured: false,
          },
        });

      console.log(`✅ Test record created successfully: ${testSpot.name}`);

      // Clean up test record
      await strapi
        .documents("api::foliage-spot.foliage-spot")
        .delete(testSpot.documentId);
      console.log("🧹 Test record cleaned up");
    } catch (error) {
      console.error("❌ Test record creation failed:", error.message);
      console.error("   Full error:", error);
    }
    console.log("");

    // Check permissions
    console.log("🔐 Checking permissions...");
    try {
      const publicRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: "public" },
        });

      if (publicRole) {
        const permissions = await strapi
          .query("plugin::users-permissions.permission")
          .findMany({
            where: { role: publicRole.id },
            filters: {
              action: {
                $contains: "foliage-spot",
              },
            },
          });

        console.log(
          `✅ Found ${permissions.length} foliage-spot permissions for public role:`
        );
        permissions.forEach((perm) => {
          console.log(`   - ${perm.action}`);
        });
      } else {
        console.error("❌ Public role not found!");
      }
    } catch (error) {
      console.error("❌ Error checking permissions:", error.message);
    }

    console.log("");
    console.log("🎯 Schema validation completed!");
  } catch (error) {
    console.error("❌ Validation failed:", error);
    throw error;
  }
}

async function main() {
  const { createStrapi, compileStrapi } = require("@strapi/strapi");

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = "error";

  await validateSchema();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
