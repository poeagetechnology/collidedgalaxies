// Script to add numeric product and variant IDs to all products in Firestore
// Run this script once to migrate your data for Shiprocket compatibility

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

function generateNumericId() {
  // Use timestamp + random for uniqueness
  return Date.now() + Math.floor(Math.random() * 10000);
}

async function migrateProductAndVariantIds() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  let updatedCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    let needsUpdate = false;
    let productNumericId = data.numericId;
    if (!productNumericId || typeof productNumericId !== 'number') {
      productNumericId = generateNumericId();
      needsUpdate = true;
    }

    // Update variants
    let variants = data.variants || [];
    let variantsChanged = false;
    if (Array.isArray(variants)) {
      variants = variants.map(variant => {
        if (!variant.numericId || typeof variant.numericId !== 'number') {
          variantsChanged = true;
          return { ...variant, numericId: generateNumericId() };
        }
        return variant;
      });
    }

    if (needsUpdate || variantsChanged) {
      await updateDoc(doc(productsRef, docSnap.id), {
        numericId: productNumericId,
        variants: variants
      });
      updatedCount++;
      console.log(`Updated product ${docSnap.id} with numericId ${productNumericId}`);
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} products.`);
}

migrateProductAndVariantIds().catch(console.error);
