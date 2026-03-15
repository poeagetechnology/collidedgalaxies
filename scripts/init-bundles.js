#!/usr/bin/env node

/**
 * Initialize Sample Bundles in Firebase
 *
 * This script creates demo bundle offers in Firestore.
 *
 * How to run:
 * 1. Get Firebase Service Account: https://console.firebase.google.com → Project Settings → Service Accounts → Generate New Private Key
 * 2. Save it as "firebase-service-account.json" in project root
 * 3. Run: node scripts/init-bundles.js
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load service account key
const serviceAccountPath = path.join(
  __dirname,
  "..",
  "firebase-service-account.json",
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ firebase-service-account.json not found in project root");
  console.error(
    "Get it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key",
  );
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Sample bundles to create
const bundlesToCreate = [
  {
    name: "Casual Comfort Bundle",
    description: "Get 3 oversized t-shirts at an amazing price",
    products: [
      { productId: "sample_1", title: "Oversized T-Shirt 1", quantity: 1 },
      { productId: "sample_2", title: "Oversized T-Shirt 2", quantity: 1 },
      { productId: "sample_3", title: "Oversized T-Shirt 3", quantity: 1 },
    ],
    originalTotalPrice: 3000,
    bundlePrice: 1999,
    isActive: true,
    category: "Oversized",
    image: "https://via.placeholder.com/400x400?text=Casual+Bundle",
  },
  {
    name: "Summer Vibes Bundle",
    description: "Perfect collection for the summer season",
    products: [
      { productId: "sample_4", title: "Plain Oversized Tee", quantity: 2 },
      { productId: "sample_5", title: "Graphic Print Shirt", quantity: 1 },
    ],
    originalTotalPrice: 2500,
    bundlePrice: 1499,
    isActive: true,
    category: "Printed",
    image: "https://via.placeholder.com/400x400?text=Summer+Bundle",
  },
  {
    name: "Street Style Pack",
    description: "Complete your urban wardrobe collection",
    products: [
      { productId: "sample_6", title: "Premium Oversized Tee", quantity: 1 },
      { productId: "sample_7", title: "Designer Print Shirt", quantity: 1 },
      { productId: "sample_8", title: "Limited Edition Tee", quantity: 1 },
    ],
    originalTotalPrice: 4500,
    bundlePrice: 2799,
    isActive: true,
    category: "Oversized",
    image: "https://via.placeholder.com/400x400?text=Street+Style+Bundle",
  },
];

async function initializeBundles() {
  try {
    console.log("🔄 Initializing demo bundles...\n");

    let createdCount = 0;
    let skippedCount = 0;

    for (const bundle of bundlesToCreate) {
      try {
        // Check if bundle already exists
        const snapshot = await db
          .collection("bundles")
          .where("name", "==", bundle.name)
          .get();

        if (!snapshot.empty) {
          console.log(
            `⏭️  Bundle "${bundle.name}" already exists. Skipping...`,
          );
          skippedCount++;
          continue;
        }

        // Create the bundle
        const docRef = await db.collection("bundles").add({
          ...bundle,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

        console.log(`✅ Created bundle: "${bundle.name}" (ID: ${docRef.id})`);
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Error creating bundle "${bundle.name}":`,
          error.message,
        );
      }
    }

    console.log("\n✅ Bundle initialization complete!");
    console.log(`📊 Summary: ${createdCount} created, ${skippedCount} skipped`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

initializeBundles();
