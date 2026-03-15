import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK from environment variables
 * Reads credentials from individual env vars set in .env
 */
export function initializeFirebaseAdmin() {
  if (admin.apps && admin.apps.length > 0) {
    console.log('ℹ️ Firebase Admin already initialized');
    return admin;
  }

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

  // Detailed logging for missing env vars
  const missingVars = [];
  if (!serviceAccount.project_id) missingVars.push('FIREBASE_PROJECT_ID');
  if (!serviceAccount.private_key) missingVars.push('FIREBASE_PRIVATE_KEY');
  if (!serviceAccount.client_email) missingVars.push('FIREBASE_CLIENT_EMAIL');

  if (missingVars.length > 0) {
    console.error('❌ Missing required Firebase Admin SDK environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    throw new Error(
      `Missing Firebase Admin credentials: ${missingVars.join(', ')}. ` +
      'Please check your .env file has FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL.'
    );
  }

  try {
    console.log('🔄 Initializing Firebase Admin SDK...');
    console.log('📋 Project ID:', serviceAccount.project_id);
    console.log('📋 Service Account Email:', serviceAccount.client_email);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', {
      message: error.message,
      code: error.code,
    });
    throw error;
  }

  return admin;
}

export default admin;
