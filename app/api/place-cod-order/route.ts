import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import fs from 'fs';

// Initialize firebase-admin (same as your update-order-status)
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  let serviceAccount: any = null;
  const svcEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (svcEnv) {
    try {
      serviceAccount = JSON.parse(svcEnv);
    } catch (e) {
      try {
        serviceAccount = JSON.parse(Buffer.from(svcEnv, 'base64').toString('utf8'));
      } catch (err) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var');
      }
    }
  } else if (svcPath) {
    try {
      const raw = fs.readFileSync(svcPath, 'utf8');
      serviceAccount = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to read service account from path', svcPath, err);
    }
  }

  if (!serviceAccount) {
    throw new Error('Service account credentials not provided');
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });
  return admin;
}

let adminApp: typeof admin | null = null;
try { 
  adminApp = initAdmin(); 
} catch (e) { 
  console.error('Failed to initialize admin:', e);
  adminApp = null; 
}

export async function POST(req: NextRequest) {
  if (!adminApp) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    console.log('🔵 COD Order API called');
    
    const body = await req.json();
    const { order } = body;

    // Validate required fields
    if (!order || !order.userId || !order.items || !order.address) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Prepare order data
    const orderData = {
      userId: order.userId,
      userEmail: order.userEmail,
      customerName: order.customerName,
      amount: order.amount,
      totalProducts: order.totalProducts,
      items: order.items,
      address: order.address,
      paymentMode: 'COD',
      paymentStatus: 'Pending',
      status: 'pending',
      createdAt: adminApp.firestore.FieldValue.serverTimestamp(),
      updatedAt: adminApp.firestore.FieldValue.serverTimestamp(),
      statusHistory: [{
        status: 'pending',
        timestamp: new Date().toISOString()
      }]
    };

    console.log('💾 Saving COD order to Firestore...');

    // Save to Firestore using Admin SDK
    const firestore = adminApp.firestore();
    const docRef = await firestore.collection('orders').add(orderData);

    console.log('✅ COD Order saved successfully:', docRef.id);

    return NextResponse.json({
      success: true,
      orderId: docRef.id,
      message: 'COD order placed successfully',
    });
  } catch (error: any) {
    console.error('❌ Error creating COD order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create COD order' },
      { status: 500 }
    );
  }
}