#!/usr/bin/env node

/**
 * Grant Admin Access Script
 * This script grants admin role to a user by their email address
 * Uses credentials from .env file (no external JSON file needed)
 * 
 * Usage: node scripts/grant-admin-access.js <email>
 * Example: node scripts/grant-admin-access.js www.7339596165@gmail.com
 */

const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Initialize Firebase Admin SDK using environment variables
try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY not found in .env');
  }

  // Handle the private key properly - it may have literal \n or actual newlines
  const formattedPrivateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: formattedPrivateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  // Validate required fields
  const requiredFields = ['project_id', 'private_key', 'client_email', 'token_uri'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required Firebase credentials in .env: ${missingFields.join(', ')}`);
  }

  console.log('📋 Initializing Firebase Admin SDK...');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}\n`);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin SDK initialized (using .env credentials)\n');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.error('\nMake sure your .env file contains:');
  console.error('  - FIREBASE_PROJECT_ID');
  console.error('  - FIREBASE_PRIVATE_KEY_ID');
  console.error('  - FIREBASE_PRIVATE_KEY');
  console.error('  - FIREBASE_CLIENT_EMAIL');
  console.error('  - FIREBASE_CLIENT_ID');
  console.error('  - FIREBASE_AUTH_URI');
  console.error('  - FIREBASE_TOKEN_URI');
  console.error('  - FIREBASE_AUTH_PROVIDER_X509_CERT_URL');
  console.error('  - FIREBASE_CLIENT_X509_CERT_URL');
  process.exit(1);
}

const db = admin.firestore();

/**
 * Grant admin access to a user by email
 * @param {string} email - User email address
 */
async function grantAdminAccess(email) {
  if (!email) {
    console.error('❌ Email address is required');
    console.error('Usage: node scripts/grant-admin-access.js <email>');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Searching for user with email: ${email}`);
    
    // Query users collection by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.error(`❌ No user found with email: ${email}`);
      console.error('\nAvailable users:');
      
      // List all users
      const allUsers = await usersRef.get();
      allUsers.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.email || 'N/A'} (Role: ${data.role || 'user'})`);
      });
      
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`\n✅ User found!`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Name: ${userData.name || 'N/A'}`);
    console.log(`   Current Role: ${userData.role || 'user'}`);

    // Check if already admin
    if (userData.role === 'admin') {
      console.log(`\n⚠️  User is already an admin!`);
      process.exit(0);
    }

    // Update user role to admin
    console.log(`\n⏳ Granting admin role...`);
    
    await usersRef.doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      adminGrantedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`\n✅ Admin access granted successfully!`);
    console.log(`   User Email: ${userData.email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   New Role: admin`);
    console.log(`\n✨ The user can now access the admin panel!`);

  } catch (error) {
    console.error(`\n❌ Error granting admin access:`, error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    // Close Firebase connection
    await admin.app().delete();
    console.log(`\n👋 Connection closed.`);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Email address is required');
  console.error('\nUsage:');
  console.error('  node scripts/grant-admin-access.js <email>');
  console.error('\nExample:');
  console.error('  node scripts/grant-admin-access.js www.7339596165@gmail.com');
  process.exit(1);
}

// Run the function
grantAdminAccess(email);
