/**
 * Run this script with Node (requires FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH env var)
 *
 * Example:
 *   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.json node scripts/migrate-orders.js
 */
const admin = require('firebase-admin');
const fs = require('fs');

function initAdmin() {
  let serviceAccount = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try { serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); } catch (e) {
      try { serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')); } catch (err) {}
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
  }

  if (!serviceAccount) {
    console.error('Service account not provided. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH');
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin.firestore();
}

async function migrate() {
  const firestore = initAdmin();
  console.log('Starting orders migration...');

  const snapshot = await firestore.collection('orders').get();
  console.log(`Found ${snapshot.size} orders`);

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    if (!('status' in data)) updates.status = data.razorpayPaymentId ? 'processing' : 'pending';
    if (!('paymentStatus' in data)) updates.paymentStatus = data.razorpayPaymentId ? 'paid' : 'pending';
    if (!('createdAt' in data)) updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
    if (!('updatedAt' in data)) updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    if (Object.keys(updates).length > 0) {
      await firestore.collection('orders').doc(doc.id).update(updates);
      updated++;
      console.log('Updated', doc.id, updates);
    }
  }

  console.log('Migration complete. Updated', updated, 'documents.');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
