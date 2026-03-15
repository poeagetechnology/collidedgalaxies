import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';


// TODO: Replace with your Firebase config if needed
const firebaseConfig = {
  apiKey: "AIzaSyB0EauSBfzLcvzuwPlel55wXQSVfj89P3Y",
  authDomain: "coga-670f5.firebaseapp.com",
  projectId: "coga-670f5",
  storageBucket: "coga-670f5.firebasestorage.app",
  messagingSenderId: "521411021199",
  appId: "1:521411021199:web:d436758790f48c0004e3fa",
  measurementId: "G-7TT62HXKQP"
};

console.log('--- FIREBASE CONFIG DEBUG ---');
console.log('firebaseConfig:', JSON.stringify(firebaseConfig, null, 2));
console.log('Resolved projectId:', firebaseConfig.projectId);
console.log('-----------------------------');

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

function generateNumericId() {
  // Generate a random 9-digit integer (safe for Firestore)
  return Math.floor(100000000 + Math.random() * 900000000);
}
async function migrateProductsAndVariants() {
  const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    console.log(`Fetched ${snapshot.size} product documents from Firestore.`);
    if (snapshot.size === 0) {
      console.warn('No products found in Firestore. Exiting migration.');
      return;
    }
  let updatedCount = 0;

  let processed = 0, skipped = 0, firstSkip = null;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    processed++;
    let skipReason = '';
    // Defensive: skip if no colors or sizes
    if (!Array.isArray(data.colors) || !Array.isArray(data.sizes)) {
      skipReason = `missing colors or sizes array`;
      console.warn(`Skipping product ${docSnap.id} (${skipReason})`);
      skipped++;
      if (!firstSkip) firstSkip = {id: docSnap.id, data, reason: skipReason};
      continue;
    }

    let productNumericId = typeof data.numericId === 'number' ? data.numericId : generateNumericId();

    const sizes = data.sizes;
    const colors = data.colors;
    const inventory = data.inventory || {};
    const variants = [];

    for (const size of sizes) {
      for (const colorObj of colors) {
        const colorName = typeof colorObj === 'string' ? colorObj : (colorObj.name || 'Default');
        const variantTitle = `${colorName} - ${size}`;
        const variantSku = `${data.slug || docSnap.id}-${colorName}-${size}`.toUpperCase().replace(/\s+/g, '-');
        let quantity = 100;
        if (typeof inventory[size] === 'number') {
          quantity = inventory[size];
        }
        const variant = {
          numericId: generateNumericId(),
          title: String(variantTitle),
          price: String(data.discountPriceFirst10Days || data.originalPrice || '0'),
          quantity: Number(quantity),
          sku: String(variantSku),
          color: String(colorName),
          size: String(size),
          image: String(data.image || ''),
          weight: typeof data.weight === 'number' ? data.weight : 0.5
        };
        // Per-variant validation
        let valid = true;
        for (const [key, value] of Object.entries(variant)) {
          if (value === undefined || value === null || (typeof value === 'string' && value.length === 0)) {
            console.error(`Invalid value for key '${key}' in variant for product ${docSnap.id}:`, variant);
            valid = false;
          }
        }
        if (typeof variant.numericId !== 'number' || isNaN(variant.numericId)) {
          console.error(`Invalid numericId in variant for product ${docSnap.id}:`, variant);
          valid = false;
        }
        if (typeof variant.quantity !== 'number' || isNaN(variant.quantity)) {
          console.error(`Invalid quantity in variant for product ${docSnap.id}:`, variant);
          valid = false;
        }
        if (!valid) {
          skipReason = `invalid variant`;
          skipped++;
          if (!firstSkip) firstSkip = {id: docSnap.id, data, reason: skipReason, variant};
          continue;
        }
        variants.push(variant);
      }
    }

    if (variants.length === 0) {
      variants.push({
        numericId: generateNumericId(),
        title: 'Default',
        price: String(data.discountPriceFirst10Days || data.originalPrice || '0'),
        quantity: 100,
        sku: `${data.slug || docSnap.id}-default`.toUpperCase(),
        color: 'Default',
        size: 'Default',
        image: String(data.image || ''),
        weight: typeof data.weight === 'number' ? data.weight : 0.5
      });
    }

    const updatePayload = {
      numericId: productNumericId,
      variants: variants
    };

    // Check Firestore document size limit (1MB)
    const payloadSize = Buffer.byteLength(JSON.stringify(updatePayload));
    if (payloadSize > 900000) {
      skipReason = `payload too large (${payloadSize} bytes)`;
      console.error(`Payload too large for product ${docSnap.id}: ${payloadSize} bytes`);
      skipped++;
      if (!firstSkip) firstSkip = {id: docSnap.id, data, reason: skipReason, payload: updatePayload};
      continue;
    }

    console.log(`Attempting to update product ${docSnap.id} with payload:`, JSON.stringify(updatePayload, null, 2));
    try {
      await updateDoc(doc(productsRef, docSnap.id), updatePayload);
      updatedCount++;
      console.log(`Updated product ${docSnap.id} with numericId ${productNumericId} and ${variants.length} variants.`);
    } catch (err) {
      console.error(`Failed to update product ${docSnap.id}:`, err);
      console.error('Payload that caused error:', JSON.stringify(updatePayload, null, 2));
      // Stop after first error for diagnosis
      break;
    }
    // ...existing code...
  }
  console.log(`Migration complete. Updated ${updatedCount} products. Processed: ${processed}, Skipped: ${skipped}`);
  if (updatedCount === 0 && firstSkip) {
    console.log('First skipped product summary:', JSON.stringify(firstSkip, null, 2));
  }
}

migrateProductsAndVariants().catch(console.error);