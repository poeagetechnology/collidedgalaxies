import admin from 'firebase-admin';

/**
 * Initialize Firebase Admin SDK from environment variables
 * Reads credentials from individual env vars set in .env
 */
export function initializeFirebaseAdmin() {
  if (admin.apps && admin.apps.length > 0) {
    console.log('✅ Firebase Admin SDK already initialized');
    return admin;
  }

  // Debug: Log which environment variables are set
  console.log('🔍 Checking Firebase Admin environment variables...');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing');
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✓ Set (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : '✗ Missing');
  console.log('FIREBASE_TYPE:', process.env.FIREBASE_TYPE ? '✓ Set' : '✗ Missing');

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
    console.error('❌ Missing required Firebase Admin SDK environment variables!');
    console.error('serviceAccount status:', {
      project_id: serviceAccount.project_id ? '✓' : '✗',
      private_key: serviceAccount.private_key ? '✓' : '✗',
      client_email: serviceAccount.client_email ? '✓' : '✗',
    });
    throw new Error(
      'Missing required Firebase Admin SDK environment variables. ' +
      'Please ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL are set in .env'
    );
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log('✅ Firebase Admin SDK initialized successfully with project:', serviceAccount.project_id);
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }

  return admin;
}

export default admin;
