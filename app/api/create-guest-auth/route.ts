import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

let cachedApp: any = null;
let cachedAuth: any = null;
let cachedDb: any = null;

function initFirebase() {
  if (cachedApp && cachedAuth && cachedDb) {
    return { app: cachedApp, auth: cachedAuth, db: cachedDb };
  }

  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    cachedApp = initializeApp(firebaseConfig);
    cachedAuth = getAuth(cachedApp);
    cachedDb = getFirestore(cachedApp);
    
    console.log('✅ Firebase initialized for guest auth');
    return { app: cachedApp, auth: cachedAuth, db: cachedDb };
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 Create Guest Auth API called');

    const body = await req.json();
    const { phoneNumber, name, email } = body;

    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const { auth, db } = initFirebase();

    // Check if a guest account with this phone number already exists
    console.log('🔍 Checking if guest account exists for phone:', phoneNumber);
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', phoneNumber), where('isGuest', '==', true));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingUser = querySnapshot.docs[0];
        const existingData = existingUser.data();
        const existingUid = existingUser.id;

        console.log('✅ Guest account found with phone:', phoneNumber);
        console.log('📝 Existing UID:', existingUid);

        // Generate new credentials for the existing account
        const uniqueSuffix = Math.random().toString(36).substring(7);
        const newPassword = `Guest_${phoneNumber}${uniqueSuffix}`;
        const anonEmail = existingData.email || `guest_${phoneNumber}_${uniqueSuffix}@collidedgalaxies.local`;

        console.log('🔄 Re-authenticating existing guest account');

        // Return the existing account with new password
        // The client will need to sign in with this
        return NextResponse.json({
          success: true,
          uid: existingUid,
          phoneNumber: phoneNumber,
          email: anonEmail,
          password: newPassword,
          isExisting: true,
          message: 'Existing guest account found. Please sign in.',
        });
      }
    } catch (queryError: any) {
      console.log('ℹ️ Query check result:', queryError.message);
      // Continue to create new account if query fails or no results
    }

    // No existing guest account found, create a new one
    console.log('✨ Creating new guest account for phone:', phoneNumber);

    // Create a unique anonymous email using phone number and timestamp
    const uniqueSuffix = Math.random().toString(36).substring(7);
    const anonEmail = `guest_${phoneNumber}_${uniqueSuffix}@collidedgalaxies.local`;
    const anonPassword = `Guest_${phoneNumber}${uniqueSuffix}`;

    console.log('📧 Creating Firebase Auth user with email:', anonEmail);

    let authUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, anonEmail, anonPassword);
      authUser = userCredential.user;
      console.log('✅ Firebase Auth user created:', authUser.uid);
    } catch (authError: any) {
      console.error('❌ Auth creation error:', authError.code);
      return NextResponse.json(
        { success: false, error: `Firebase auth error: ${authError.message}` },
        { status: 400 }
      );
    }

    // Create Firestore user document
    try {
      const userRef = doc(db, 'users', authUser.uid);
      const userData = {
        uid: authUser.uid,
        phoneNumber: phoneNumber,
        name: name || 'Guest User',
        email: email || anonEmail,
        isAnonymous: true,
        isGuest: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        linkedAt: null,
        orders: [],
        addresses: [],
        wishlist: [],
      };

      await setDoc(userRef, userData);
      console.log('✅ Guest user Firestore document created:', authUser.uid);
    } catch (firestoreError: any) {
      console.error('⚠️ Firestore error (non-critical):', firestoreError.message);
      // Continue anyway, user is created in Auth
    }

    return NextResponse.json({
      success: true,
      uid: authUser.uid,
      phoneNumber: phoneNumber,
      email: anonEmail,
      password: anonPassword,
      isExisting: false,
      message: 'New guest account created successfully',
    });
  } catch (error: any) {
    console.error('❌ Error in guest auth creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create guest account',
      },
      { status: 500 }
    );
  }
}
