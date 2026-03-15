#!/usr/bin/env node

/**
 * Initialize Categories in Firebase
 * 
 * This script creates the basic product categories in Firestore.
 * 
 * How to run:
 * 1. Get Firebase Service Account: https://console.firebase.google.com → Project Settings → Service Accounts → Generate New Private Key
 * 2. Save it as "firebase-service-account.json" in project root
 * 3. Run: node scripts/init-categories.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ firebase-service-account.json not found in project root');
  console.error('Get it from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Categories to create
const categoriesToCreate = [
  { name: 'Oversized', imageUrl: '' },
  { name: 'Plain Oversized', imageUrl: '' },
];

async function initializeCategories() {
  try {
    console.log('🔄 Initializing categories...\n');

    for (const category of categoriesToCreate) {
      // Check if category already exists
      const snapshot = await db.collection('categories').where('name', '==', category.name).get();

      if (snapshot.empty) {
        // Add new category
        await db.collection('categories').add({
          name: category.name,
          imageUrl: category.imageUrl,
        });
        console.log(`✅ Created category: "${category.name}"`);
      } else {
        console.log(`ℹ️  Category "${category.name}" already exists`);
      }
    }

    console.log('\n✅ Categories initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    process.exit(1);
  }
}

initializeCategories();
