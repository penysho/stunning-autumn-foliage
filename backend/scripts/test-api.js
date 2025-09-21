"use strict";

/**
 * Test API endpoints to debug permission issues
 */

async function testAPI() {
  const baseURL = "http://localhost:1337/api";

  console.log("Testing API endpoints...\n");

  // Test endpoints
  const endpoints = [
    "/foliage-spots",
    "/foliage-spots?populate=image",
    "/foliage-spots?filters[featured][$eq]=true",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${baseURL}${endpoint}`);

      const response = await fetch(`${baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(`Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: Found ${data.data?.length || 0} items`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Error: ${errorText}`);
      }

      console.log("─".repeat(50));
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
      console.log("─".repeat(50));
    }
  }
}

// Check if we're running this script directly
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };
