// Quick test to verify Firebase Admin credentials are being loaded
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

const env = {};
for (const line of lines) {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^"(.+)"$/, '$1');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  }
}

console.log('=== Firebase Admin Credentials Test ===');
console.log('FIREBASE_PROJECT_ID:', env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing');
console.log('FIREBASE_PRIVATE_KEY:', env.FIREBASE_PRIVATE_KEY ? `✓ Set (${env.FIREBASE_PRIVATE_KEY.length} chars)` : '✗ Missing');
console.log('FIREBASE_TYPE:', env.FIREBASE_TYPE ? '✓ Set' : '✗ Missing');

const hasAllRequired = 
  env.FIREBASE_PROJECT_ID &&
  env.FIREBASE_CLIENT_EMAIL &&
  env.FIREBASE_PRIVATE_KEY &&
  env.FIREBASE_TYPE;

if (hasAllRequired) {
  console.log('✅ All required credentials are present in .env.local!');
} else {
  console.log('❌ Missing credentials in .env.local');
}

// Test private key parsing
const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (privateKey && privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY')) {
  console.log('✅ Private key format is correct');
} else {
  console.log('❌ Private key format might be incorrect');
}
