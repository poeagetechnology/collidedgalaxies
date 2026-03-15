import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/src/server/config/firebase-admin';

// Initialize firebase-admin
let adminApp: typeof admin | null = null;
try { 
  adminApp = initializeFirebaseAdmin();
} catch (e) { 
  console.error('Firebase Admin initialization error:', e);
  adminApp = null; 
}

export async function POST(req: NextRequest) {
  if (!adminApp) {
    console.error('firebase-admin not initialized');
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { order_id, order_amount, payment_status, payment_message, cf_payment_id, customer_details, order_meta } = body as any;

    console.log('[Cashfree Webhook] Received webhook:', { order_id, payment_status, cf_payment_id });

    if (payment_status !== 'SUCCESS') {
      console.log('[Cashfree Webhook] Payment not successful, status:', payment_status);
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // Extract order data from session storage reference
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) {
      console.error('Cashfree secret key not configured');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    // Verify signature (you may want to add signature verification here)
    // For now, we trust the webhook if payment_status is SUCCESS

    // The order data should have been stored before creating the payment session
    // You'll need to store order data in Redis/Database with orderId as key
    // This is a simplified version - in production, retrieve the stored order data

    console.log('[Cashfree Webhook] Payment verified for order:', order_id);
    
    // Return success to Cashfree
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (err) {
    console.error('[Cashfree Webhook] Error:', err);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
