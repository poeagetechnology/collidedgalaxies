import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
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

export async function GET(req: NextRequest) {
  if (!adminApp) {
    console.error('firebase-admin not initialized');
    return NextResponse.redirect(new URL('/checkout?error=server-error', req.url));
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');

    console.log('[Cashfree Return] Processing return for order:', orderId);

    if (!orderId) {
      console.error('[Cashfree Return] Missing order_id');
      return NextResponse.redirect(new URL('/checkout?error=invalid-order', req.url));
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";

    if (!appId || !secretKey) {
      console.error('[Cashfree Return] Missing Cashfree credentials');
      return NextResponse.redirect(new URL('/checkout?error=config-error', req.url));
    }

    // Fetch order details from Cashfree API to verify payment status
    try {
      const orderDetailsUrl = `https://api.cashfree.com/pg/orders/${orderId}`;
      const response = await axios.get(orderDetailsUrl, {
        headers: {
          "x-api-version": apiVersion,
          "x-client-id": appId,
          "x-client-secret": secretKey,
        },
      });

      const orderData = response.data;
      console.log('[Cashfree Return] Order details:', orderData);

      if (orderData.order_status === 'PAID' || orderData.order_status === 'ACTIVE') {
        console.log('[Cashfree Return] Payment successful for order:', orderId);
        // Redirect to success page - the actual order saving should happen via webhook
        return NextResponse.redirect(new URL(`/success?orderId=${orderId}`, req.url));
      } else if (orderData.order_status === 'PENDING') {
        console.log('[Cashfree Return] Payment pending for order:', orderId);
        return NextResponse.redirect(new URL(`/checkout?pending=${orderId}`, req.url));
      } else {
        console.log('[Cashfree Return] Payment failed for order:', orderId);
        return NextResponse.redirect(new URL('/checkout?error=payment-failed', req.url));
      }
    } catch (err) {
      console.error('[Cashfree Return] Error fetching order details:', err);
      return NextResponse.redirect(new URL('/checkout?error=verification-error', req.url));
    }
  } catch (err) {
    console.error('[Cashfree Return] Error:', err);
    return NextResponse.redirect(new URL('/checkout?error=unknown-error', req.url));
  }
}
