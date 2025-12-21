import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import admin from 'firebase-admin';
import fs from 'fs';

// Initialize firebase-admin using a service account JSON provided via env or file path
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  let serviceAccount: any = null;
  const svcEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (svcEnv) {
    try {
      serviceAccount = JSON.parse(svcEnv);
    } catch (e) {
      // maybe base64-encoded
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
    throw new Error('Service account credentials not provided. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH');
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });
  return admin;
}

let adminApp: typeof admin | null = null;
try { adminApp = initAdmin(); } catch (e) { adminApp = null; }

export async function POST(req: NextRequest) {
  if (!adminApp) {
    console.error('firebase-admin not initialized');
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order } = body as any;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !order) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keySecret || !keyId) {
      console.error('Razorpay credentials not configured on the server.');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Verify signature: HMAC_SHA256(order_id|payment_id)
    const shasum = crypto.createHmac('sha256', keySecret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    if (digest !== razorpay_signature) {
      console.warn('Razorpay signature mismatch', { digest, signature: razorpay_signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verify order amount by fetching Razorpay order
    const razor = new Razorpay({ key_id: keyId, key_secret: keySecret });
    let remoteOrder: any = null;
    try {
      remoteOrder = await razor.orders.fetch(razorpay_order_id);
    } catch (err) {
      console.error('Failed to fetch razorpay order', err);
      return NextResponse.json({ error: 'Failed to verify order with payment gateway' }, { status: 400 });
    }

    // razorpay stores amount in paise
    const expectedPaise = Math.round((order.amount || 0) * 100);
    if (typeof remoteOrder?.amount !== 'undefined' && remoteOrder.amount !== expectedPaise) {
      console.warn('Amount mismatch', { remoteAmount: remoteOrder.amount, expectedPaise });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    const firestore = adminApp.firestore();

    // Duplicate check by razorpayOrderId
    const dupQ = await firestore.collection('orders').where('razorpayOrderId', '==', razorpay_order_id).limit(1).get();
    if (!dupQ.empty) {
      const existing = dupQ.docs[0];
      return NextResponse.json({ success: true, id: existing.id, duplicate: true });
    }

    if (!order.userId) {
      console.error('❌ Order validation failed: Missing userId');
      return NextResponse.json({ error: 'User authentication required' }, { status: 400 });
    }

    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.error('❌ Order validation failed: Empty or invalid items array');
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    if (!order.address || !order.address.firstName) {
      console.error('❌ Order validation failed: Missing address');
      return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
    }

    const payload = {
      userId: order.userId || null,
      userEmail: order.userEmail || null,
      customerName: order.customerName || null,
      amount: order.amount || 0,
      totalProducts: order.totalProducts || 0,
      items: order.items || [],
      address: order.address || null,
      paymentMode: order.paymentMode || 'Online',
      paymentStatus: 'paid',
      status: 'processing',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      createdAt: adminApp.firestore.FieldValue.serverTimestamp(),
      updatedAt: adminApp.firestore.FieldValue.serverTimestamp(),
    } as any;

    const ref = await firestore.collection('orders').add(payload);
    return NextResponse.json({ success: true, id: ref.id });
  } catch (err) {
    console.error('Error in verify-payment route:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
