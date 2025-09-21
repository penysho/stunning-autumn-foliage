"use strict";

/**
 * Initialize foliage spots application
 * Sets up permissions and imports initial data
 */

const fs = require("fs-extra");
const path = require("path");
const mime = require("mime-types");

// Foliage spots data
const foliageSpots = [
  {
    name: "八幡平アスピーテライン",
    nameEn: "Hachimantai Aspite Line",
    description:
      "全長約27kmの山岳道路。標高1,600m付近では早期に紅葉が楽しめます。",
    foliageStatus: "green",
    image: "sample1.jpg",
    latitude: 39.9392,
    longitude: 140.8517,
    featured: true,
  },
  {
    name: "岩手山焼走り溶岩流",
    nameEn: "Mt.Iwate Yakehashiri Lava Flow",
    description:
      "岩手山の火山活動で形成された溶岩流跡地。独特の景観と紅葉のコントラストが魅力。",
    foliageStatus: "green",
    image: "genbugan.JPEG",
    latitude: 39.8503,
    longitude: 140.9989,
    featured: false,
  },
  {
    name: "八幡平山頂散策路",
    nameEn: "Hachimantai Summit Walking Trail",
    description:
      "標高1,613mの山頂付近を散策できる遊歩道。360度の大パノラマが楽しめます。",
    foliageStatus: "beginning",
    image: "santyo.JPG",
    latitude: 39.9589,
    longitude: 140.8556,
    featured: true,
  },
  {
    name: "三ツ石山",
    nameEn: "Mt.Mitsuishi",
    description: "八幡平連峰の最高峰。登山道からの紅葉景色は格別です。",
    foliageStatus: "green",
    image: "sample2.jpg",
    latitude: 39.9167,
    longitude: 140.9167,
    featured: false,
  },
  {
    name: "松川大橋",
    nameEn: "Matsukawa Ohashi Bridge",
    description: "松川渓谷にかかる橋からの眺望が素晴らしい紅葉スポット。",
    foliageStatus: "green",
    image: "sample3.jpg",
    latitude: 39.9,
    longitude: 140.8833,
    featured: false,
  },
  {
    name: "松川渓谷玄武岩",
    nameEn: "Matsukawa Valley Genbuiwa",
    description: "松川の清流と玄武岩の奇岩、紅葉が織りなす絶景ポイント。",
    foliageStatus: "green",
    image: "genbugan.JPEG",
    latitude: 39.8889,
    longitude: 140.8778,
    featured: false,
  },
  {
    name: "黒谷地湿原",
    nameEn: "Kuroyachi Marsh",
    description: "高層湿原と周囲の山々の紅葉が美しいハイキングスポット。",
    foliageStatus: "green",
    image: "sample4.jpg",
    latitude: 39.9333,
    longitude: 140.8667,
    featured: false,
  },
  {
    name: "安比高原二次ブナ林",
    nameEn: "Appi Kogen Secondary Beech Forest",
    description: "ブナの巨木が立ち並ぶ神秘的な森林。黄金色に輝く紅葉が魅力。",
    foliageStatus: "green",
    image: "sample5.jpg",
    latitude: 40.0167,
    longitude: 140.95,
    featured: false,
  },
  {
    name: "森の大橋",
    nameEn: "Mori-no-Ohashi Bridge",
    description: "渓谷に架かる橋からの紅葉展望が楽しめる人気スポット。",
    foliageStatus: "green",
    image: "morinoohashi.jpg",
    latitude: 39.92,
    longitude: 140.87,
    featured: true,
  },
  {
    name: "藤七温泉周辺",
    nameEn: "Toshichi Onsen Area",
    description:
      "秘湯として知られる温泉周辺の紅葉。標高1,400mからの眺望も魅力。",
    foliageStatus: "green",
    image: "sample6.jpg",
    latitude: 39.8833,
    longitude: 140.9,
    featured: false,
  },
];

/**
 * Check if this is the first run of initialization
 */
async function checkFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "foliage-setup",
  });
  const initHasRun = await pluginStore.get({ key: "initHasRun" });
  await pluginStore.set({ key: "initHasRun", value: true });
  return !initHasRun;
}

/**
 * Setup public permissions for foliage-spot API
 */
async function setupPermissions() {
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) {
    throw new Error("Public role not found!");
  }

  const permissions = [
    "api::foliage-spot.foliage-spot.find",
    "api::foliage-spot.foliage-spot.findOne",
  ];

  for (const action of permissions) {
    const exists = await strapi
      .query("plugin::users-permissions.permission")
      .findOne({
        where: { action, role: publicRole.id },
      });

    if (!exists) {
      await strapi.query("plugin::users-permissions.permission").create({
        data: { action, role: publicRole.id },
      });
      console.log(`  ✓ Created permission: ${action}`);
    } else {
      console.log(`  → Permission exists: ${action}`);
    }
  }
}

/**
 * Get file data for upload
 */
function getFileData(fileName) {
  const filePath = path.join(__dirname, "..", "public", fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  Image not found: ${fileName}`);
    return null;
  }

  const stats = fs.statSync(filePath);
  const ext = path.extname(fileName).substring(1);
  const mimeType = mime.lookup(ext) || "application/octet-stream";

  return {
    filepath: filePath,
    originalFileName: fileName,
    size: stats.size,
    mimetype: mimeType,
  };
}

/**
 * Upload file to Strapi media library
 */
async function uploadFile(fileData, name) {
  try {
    const result = await strapi
      .plugin("upload")
      .service("upload")
      .upload({
        files: fileData,
        data: {
          fileInfo: {
            alternativeText: `Image for ${name}`,
            caption: name,
            name: name.replace(/\.[^/.]+$/, ""),
          },
        },
      });
    return result?.[0] || null;
  } catch (error) {
    console.error(`  ❌ Upload failed for ${name}:`, error.message);
    return null;
  }
}

/**
 * Import foliage spots into database
 */
async function importFoliageSpots() {
  const existingCount = await strapi
    .documents("api::foliage-spot.foliage-spot")
    .count();

  if (existingCount > 0) {
    console.log(`  → ${existingCount} foliage spots already exist`);
    return;
  }

  let successCount = 0;

  for (const spot of foliageSpots) {
    try {
      // Handle image upload
      let imageFile = null;
      if (spot.image) {
        const fileData = getFileData(spot.image);
        if (fileData) {
          imageFile = await uploadFile(fileData, spot.name);
        }
      }

      // Create foliage spot
      await strapi.documents("api::foliage-spot.foliage-spot").create({
        data: {
          ...spot,
          image: imageFile,
          publishedAt: new Date(),
        },
      });

      successCount++;
      console.log(`  ✓ Created: ${spot.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${spot.name}:`, error.message);
    }
  }

  console.log(
    `  → Created ${successCount}/${foliageSpots.length} foliage spots`
  );
}

/**
 * Main initialization function
 */
async function initializeFoliageApp() {
  try {
    console.log("🚀 Initializing Foliage Spots Application...\n");

    // Check if already initialized
    const isFirstRun = await checkFirstRun();
    if (!isFirstRun) {
      console.log("⚠️  Application already initialized.");
      console.log("   To reinitialize, clear your database first.");
      return;
    }

    // Setup permissions
    console.log("📋 Step 1: Setting up permissions...");
    await setupPermissions();
    console.log("✅ Permissions configured\n");

    // Import data
    console.log("📋 Step 2: Importing foliage spots...");
    await importFoliageSpots();
    console.log("✅ Data import completed\n");

    console.log("🎉 Initialization completed!");
    console.log("\nYou can now:");
    console.log("- Access API at: http://localhost:1337/api/foliage-spots");
    console.log("- Manage content: http://localhost:1337/admin");
    console.log("- Start frontend: cd ../frontend && pnpm dev");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
}

/**
 * Script entry point
 */
async function main() {
  const { createStrapi, compileStrapi } = require("@strapi/strapi");

  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = "error";

  await initializeFoliageApp();
  await app.destroy();

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
