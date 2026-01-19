/**
 * Run this script with Node after setting up .env file with Firebase credentials
 *
 * Example:
 *   node scripts/migrate-orders.js
 *
 * Make sure your .env file has FIREBASE_* variables set
 */
const admin = require('firebase-admin');
require('dotenv').config();

function initAdmin() {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };

  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('Missing required Firebase Admin SDK environment variables in .env file');
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
    if (!('status' in data)) updates.status = data.cashfreePaymentId ? 'processing' : 'pending';
    if (!('paymentStatus' in data)) updates.paymentStatus = data.cashfreePaymentId ? 'paid' : 'pending';
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
