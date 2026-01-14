import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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
    console.log('✅ Firebase initialized successfully');
    return cachedDb;
  } catch (error: any) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔵 COD Order API called');

    const body = await req.json();
    const { order } = body;

    console.log('📦 Received order:', {
      userId: order?.userId,
      itemsCount: order?.items?.length,
      hasAddress: !!order?.address,
    });

    // Validate required fields
    if (!order || !order.userId || !order.items || !order.address) {
      console.error('❌ Missing required fields in order');
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Initialize Firebase
    let db;
    try {
      db = initFirebaseClient();
      console.log('✅ Firebase initialized');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase');
    }

    // Prepare order data matching the Firestore structure
    const orderData = {
      userId: order.userId,
      userEmail: order.userEmail || '',
      customerName: order.customerName || '',
      amount: parseFloat(order.amount) || 0,
      totalProducts: order.totalProducts || 0,
      items: (order.items || []).map((item: any) => ({
        id: item.id || '',
        productId: item.productId || item.id || '',
        title: item.title || '',
        price: String(item.price || '0'),
        quantity: item.quantity || 1,
        size: item.size || '',
        color: item.color || {},
        image: item.image || '',
        isCombo: item.isCombo || false,
        uniqueKey: item.uniqueKey || `item_${Date.now()}`,
      })),
      address: {
        firstName: order.address.firstName || '',
        lastName: order.address.lastName || '',
        streetAddress: order.address.address || order.address.streetAddress || '',
        city: order.address.city || '',
        state: order.address.state || '',
        pincode: String(order.address.postalCode || order.address.pincode || ''),
        mobileNumber: String(order.address.mobileNumber || ''),
        landmark: order.address.landmark || '',
      },
      paymentMode: 'COD',
      paymentStatus: 'paid',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
      }]
    };

    console.log('💾 Saving COD order to Firestore...');
    console.log('📋 Order data:', JSON.stringify(orderData, null, 2));

    // Save to Firestore using client SDK
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, orderData);

    console.log('✅ COD Order saved successfully:', docRef.id);

    return NextResponse.json({
      success: true,
      orderId: docRef.id,
      message: 'COD order placed successfully',
    });
  } catch (error: any) {
    console.error('❌ Error in COD order endpoint:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to create COD order';
    
    if (error.message?.includes('UNAUTHENTICATED') || error.message?.includes('invalid authentication')) {
      console.error('🔐 Authentication Issue');
      errorMessage = 'Firebase authentication failed. Please try again.';
    } else if (error.message?.includes('Missing Firebase') || error.message?.includes('NEXT_PUBLIC_FIREBASE')) {
      console.error('⚠️ Missing Environment Variables');
      errorMessage = 'Firebase configuration is incomplete.';
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      errorMessage = 'Permission denied. Check Firestore security rules.';
    } else {
      console.error('📋 Full error details:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}