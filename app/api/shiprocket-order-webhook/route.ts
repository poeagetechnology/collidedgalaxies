import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import admin from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Order webhook received:', {
      order_id: body.order_id,
      status: body.status,
      email: body.email,
      phone: body.phone,
      total: body.total_amount_payable
    });

    // Prepare order data for Firebase
    const orderData = {
      shiprocketOrderId: body.order_id,
      status: body.status === 'SUCCESS' ? 'confirmed' : 'pending',
      email: body.email || '',
      phone: body.phone || '',
      totalAmount: parseFloat(body.total_amount_payable) || 0,
      paymentType: body.payment_type || 'CASH_ON_DELIVERY',
      items: body.cart_data?.items || [],
      shippingAddress: body.shipping_address || {},
      billingAddress: body.billing_address || {},
      couponCode: body.coupon_code || '',
      discountAmount: parseFloat(body.discount_amount) || 0,
      taxAmount: parseFloat(body.tax_amount) || 0,
      shippingAmount: parseFloat(body.shipping_amount) || 0,
      notes: body.notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      webhookData: body // Store full webhook data for reference
    };

    // Save to Firebase Firestore
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, orderData);

    console.log('Order saved to Firebase:', docRef.id);

    // Optional: Trigger additional actions (email, SMS, etc.)
    // await sendOrderConfirmationEmail(body.email, orderData);

    return NextResponse.json({
      success: true,
      message: 'Order processed successfully',
      order_ref: docRef.id,
      shiprocket_order_id: body.order_id
    });
  } catch (error) {
    console.error('Error processing order webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process order',
        details: String(error)
      },
      { status: 500 }
    );
  }
}
