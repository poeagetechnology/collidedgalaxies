import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

/**
 * Shiprocket Webhook - Order Placed
 * Receives order details when a customer completes checkout on Shiprocket
 * 
 * This webhook is triggered after successful payment
 * Merchants must store the order and process accordingly
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎉 [Shiprocket Order Webhook] Order placement received');

    // Parse order data from Shiprocket
    const orderData = await request.json();
    
    console.log('📋 [Shiprocket Order Webhook] Order details:', {
      order_id: orderData.order_id,
      email: orderData.email,
      phone: orderData.phone,
      status: orderData.status,
      total_amount: orderData.total_amount_payable,
      payment_type: orderData.payment_type
    });

    // Validate required fields
    if (!orderData.order_id || !orderData.email || orderData.status !== 'SUCCESS') {
      console.error('❌ [Shiprocket Order Webhook] Invalid order data or failed payment');
      return NextResponse.json(
        { error: 'Invalid order data', received_status: orderData.status },
        { status: 400 }
      );
    }

    // Store order in Firestore
    try {
      const ordersCollection = collection(db, 'orders');
      
      const orderPayload = {
        shiprocket_order_id: orderData.order_id,
        email: orderData.email,
        phone: orderData.phone,
        payment_type: orderData.payment_type, // CASH_ON_DELIVERY, PREPAID, etc.
        total_amount: orderData.total_amount_payable,
        status: 'pending', // Your internal status
        shiprocket_status: orderData.status,
        cart_items: orderData.cart_data?.items || [],
        
        // Shipping details (if provided)
        shipping_address: orderData.shipping_address || null,
        billing_address: orderData.billing_address || null,
        
        // Payment details
        payment_method: orderData.payment_method || null,
        payment_status: orderData.payment_status || 'pending',
        
        // Timestamps
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        
        // Raw webhook payload for reference
        webhook_payload: orderData
      };

      const docRef = await addDoc(ordersCollection, orderPayload);
      
      console.log('✅ [Shiprocket Order Webhook] Order stored in database:', docRef.id);

      // TODO: Send confirmation email to customer
      // await sendOrderConfirmationEmail(orderData.email, orderData);

      // TODO: Trigger inventory update if needed
      // await updateInventoryFromOrder(orderData.cart_data?.items);

      // TODO: Send notification to admin/team
      // await notifyAdminOfNewOrder(orderData);

      return NextResponse.json({
        status: 'success',
        message: 'Order received and processed',
        order_id: orderData.order_id,
        database_ref: docRef.id
      }, { status: 201 });

    } catch (dbError) {
      console.error('❌ [Shiprocket Order Webhook] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store order', details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ [Shiprocket Order Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process order webhook', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch order details for testing
 * In production, only accept POST from Shiprocket webhooks
 */
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('order_id');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order_id parameter' },
        { status: 400 }
      );
    }

    // Query order from Firestore
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where('shiprocket_order_id', '==', orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = snapshot.docs[0].data();
    return NextResponse.json({
      status: 'success',
      order: {
        id: snapshot.docs[0].id,
        ...order
      }
    });

  } catch (error) {
    console.error('❌ [Shiprocket Order Webhook] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
