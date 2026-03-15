import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

let cachedDb: any = null;

function initFirebaseClient() {
  if (cachedDb) {
    return cachedDb;
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
    return cachedDb;
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 Link Phone Account API called');

    const body = await req.json();
    const { userId, phoneNumber, userName, userEmail } = body;

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'userId and phoneNumber are required' },
        { status: 400 }
      );
    }

    const db = initFirebaseClient();

    // Check if there's an existing anonymous account with this phone number
    const usersRef = collection(db, 'users');
    const phoneQuery = query(usersRef, where('phoneNumber', '==', phoneNumber));
    const existingSnapshot = await getDocs(phoneQuery);

    if (existingSnapshot.empty) {
      console.log('ℹ️ No existing phone account found');
      return NextResponse.json({
        success: true,
        linked: false,
        message: 'No existing phone account to link',
      });
    }

    // Found an existing guest account
    const existingDoc = existingSnapshot.docs[0];
    const existingUserId = existingDoc.id;

    console.log('🔗 Found existing guest account:', existingUserId);

    // Use batch to update multiple documents
    const batch = writeBatch(db);

    // Merge data: Transfer orders and other data to the new authenticated user
    const existingData = existingDoc.data();

    // Update the authenticated user document to include guest's orders and data
    const userDocRef = doc(db, 'users', userId);

    // Prepare merged addresses (avoid duplicates)
    const existingAddresses = existingData.addresses || [];
    const mergedAddresses = existingAddresses; // Use guest addresses if user doesn't have any

    batch.update(userDocRef, {
      phoneNumber: phoneNumber.replace(/\D/g, ''), // Normalize to digits only
      linkedPhoneNumber: phoneNumber.replace(/\D/g, ''),
      linkedAt: new Date().toISOString(),
      convertedFromGuest: true,
      convertedFromGuestUID: existingUserId,
      // Merge addresses from guest account
      ...(mergedAddresses.length > 0 && {
        addresses: mergedAddresses,
      }),
      ...(existingData.wishlist && existingData.wishlist.length > 0 && {
        wishlist: [...new Set([...(existingData.wishlist || [])]), ],
      }),
    });

    // Mark guest account as converted
    const guestRef = doc(db, 'users', existingUserId);
    batch.update(guestRef, {
      convertedToAuthUser: true,
      convertedToAuthUID: userId,
      convertedAt: new Date().toISOString(),
    });

    // Migrate all orders from guest UID to new authenticated user
    const ordersRef = collection(db, 'orders');
    const guestOrdersQuery = query(ordersRef, where('userId', '==', existingUserId));
    const guestOrdersSnapshot = await getDocs(guestOrdersQuery);

    console.log(`📦 Found ${guestOrdersSnapshot.docs.length} orders to migrate`);

    guestOrdersSnapshot.forEach((orderDoc) => {
      batch.update(orderDoc.ref, {
        userId: userId,
      });
    });

    // Commit all updates in batch
    await batch.commit();

    console.log('✅ Phone account linked and orders migrated successfully');

    return NextResponse.json({
      success: true,
      linked: true,
      previousGuestId: existingUserId,
      message: 'Phone account linked to authenticated user',
    });
  } catch (error: any) {
    console.error('❌ Error linking phone account:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to link phone account',
      },
      { status: 500 }
    );
  }
}
