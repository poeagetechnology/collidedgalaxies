import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { hashPhoneNumber } from '@/src/utils/hash-phone.utils';

let cachedDb: any = null;
let cachedAuth: any = null;

function initFirebaseClient() {
  if (cachedDb && cachedAuth) {
    return { db: cachedDb, auth: cachedAuth };
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

    const app = initializeApp(firebaseConfig);
    cachedDb = getFirestore(app);
    cachedAuth = getAuth(app);
    console.log('✅ Firebase initialized for guest user');
    return { db: cachedDb, auth: cachedAuth };
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 Guest User Creation API called');

    const body = await req.json();
    const { phoneNumber, name, email } = body;

    // Validate phone number
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    if (!normalizedPhone || !/^\d{10}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format. Must be 10 digits.' },
        { status: 400 }
      );
    }

    const { db, auth } = initFirebaseClient();

    // Generate deterministic guest ID from phone number
    const guestId = hashPhoneNumber(normalizedPhone);
    console.log(`🔍 Generated guest ID: ${guestId} for phone: ${normalizedPhone}`);

    // Check if a guest account with this phone number already exists
    const guestUserRef = doc(db, 'users', guestId);
    const existingUserSnap = await getDoc(guestUserRef);

    if (existingUserSnap.exists()) {
      console.log('👤 Guest account with this phone number already exists');
      return NextResponse.json({
        success: true,
        userId: guestId,
        exists: true,
        message: 'Guest account already exists for this phone number',
      });
    }

    // Create a unique anonymous email using phone number
    const anonymousEmail = `guest_${normalizedPhone}_${Date.now()}@guest.collidedgalaxies.local`;

    console.log('📧 Creating Firebase Auth user with email:', anonymousEmail);

    // Create Firebase Auth user
    let authUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, anonymousEmail, `guest_${normalizedPhone}`);
      authUser = userCredential.user;
      console.log('✅ Firebase Auth user created:', authUser.uid);
    } catch (authError: any) {
      console.error('❌ Auth creation error:', authError.message);
      // If email already exists, try a different one
      if (authError.code === 'auth/email-already-in-use') {
        const uniqueEmail = `guest_${normalizedPhone}_${Math.random().toString(36).substring(7)}@guest.collidedgalaxies.local`;
        const userCredential = await createUserWithEmailAndPassword(auth, uniqueEmail, `guest_${normalizedPhone}`);
        authUser = userCredential.user;
      } else {
        throw authError;
      }
    }

    // Create Firestore user document with hashed phone number as ID
    const userData = {
      uid: authUser.uid,
      authUID: authUser.uid,
      phoneNumber: normalizedPhone,
      name: name || 'Guest User',
      email: email || anonymousEmail,
      authEmail: anonymousEmail,
      isAnonymous: true,
      isGuest: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedAt: null, // Will be set when user logs in with verified phone
      orders: [],
      addresses: [],
      wishlist: [],
    };

    await setDoc(guestUserRef, userData);
    console.log('✅ Guest user document created in Firestore with ID:', guestId);

    return NextResponse.json({
      success: true,
      userId: guestId, // Return the hashed ID, not the auth UID
      authUID: authUser.uid,
      phoneNumber: normalizedPhone,
      message: 'Guest account created successfully',
    });
  } catch (error: any) {
    console.error('❌ Error in guest user creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create guest user account',
      },
      { status: 500 }
    );
  }
}
