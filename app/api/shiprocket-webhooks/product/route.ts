import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Shiprocket Webhook - Product Updates
 * Receives product catalog updates from Shiprocket
 * Validates HMAC signature before processing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📦 [Shiprocket Webhook] Product update received');

    // Verify HMAC signature
    const hmacHeader = request.headers.get('X-Api-HMAC-SHA256');
    const apiKey = request.headers.get('X-Api-Key');
    
    if (!hmacHeader || !apiKey) {
      console.error('❌ [Shiprocket Webhook] Missing HMAC or API Key header');
      return NextResponse.json(
        { error: 'Missing authentication headers' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.text();
    const secretKey = process.env.SHIPROCKET_SECRET_KEY;

    if (!secretKey) {
      console.error('❌ [Shiprocket Webhook] Missing secret key in environment');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify signature
    const calculatedHmac = crypto
      .createHmac('sha256', secretKey)
      .update(body)
      .digest('base64');

    if (calculatedHmac !== hmacHeader) {
      console.error('❌ [Shiprocket Webhook] HMAC verification failed');
      console.error('Expected:', hmacHeader);
      console.error('Calculated:', calculatedHmac);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse product data
    const productData = JSON.parse(body);
    console.log('✅ [Shiprocket Webhook] HMAC verified, processing product:', productData.id);

    // TODO: Update product in your database
    // This is where you would update Firestore or your product database
    // with the product data from Shiprocket

    /*
    Example:
    const productRef = doc(db, 'products', productData.id);
    await updateDoc(productRef, {
      title: productData.title,
      description: productData.body_html,
      category: productData.product_type,
      image: productData.image?.src,
      updatedAt: new Date(),
      // ... other fields
    });
    */

    console.log('✅ [Shiprocket Webhook] Product processed successfully');

    return NextResponse.json({
      status: 'success',
      message: 'Product update processed',
      product_id: productData.id
    });
  } catch (error) {
    console.error('❌ [Shiprocket Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
