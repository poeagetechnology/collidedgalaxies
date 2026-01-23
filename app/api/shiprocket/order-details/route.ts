import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Shiprocket API - Fetch Order Details
 * Retrieve order details by order ID from Shiprocket backend
 * 
 * This API is called to get real-time order status and details
 * for order verification, shipping coordination, and record-keeping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      console.error('❌ [Shiprocket Order Details] Missing order_id');
      return NextResponse.json(
        { error: 'Missing required parameter: order_id' },
        { status: 400 }
      );
    }

    console.log('📋 [Shiprocket Order Details] Fetching details for order:', order_id);

    // Get credentials
    const apiKey = process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY;
    const secretKey = process.env.SHIPROCKET_SECRET_KEY;

    if (!apiKey || !secretKey) {
      console.error('❌ [Shiprocket Order Details] Missing API credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Prepare request payload
    const timestamp = new Date().toISOString();
    const payload = {
      order_id: order_id,
      timestamp: timestamp
    };

    const payloadString = JSON.stringify(payload);

    // Generate HMAC signature
    const hmacSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payloadString)
      .digest('base64');

    console.log('🔑 [Shiprocket Order Details] HMAC signature generated');

    // Call Shiprocket API
    const apiUrl = 'https://fastrr-api-dev.pickrr.com/api/v1/custom-platform-order/details';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-HMAC-SHA256': hmacSignature
      },
      body: payloadString
    });

    console.log('📡 [Shiprocket Order Details] API response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [Shiprocket Order Details] API error:', response.status, error);
      return NextResponse.json(
        { error: 'Failed to fetch order details', details: error },
        { status: response.status }
      );
    }

    const orderDetails = await response.json();
    console.log('✅ [Shiprocket Order Details] Order details retrieved:', orderDetails);

    return NextResponse.json({
      status: 'success',
      order_id: order_id,
      data: orderDetails
    });

  } catch (error) {
    console.error('❌ [Shiprocket Order Details] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
