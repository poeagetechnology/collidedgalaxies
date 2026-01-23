import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Shiprocket Webhook - Collection/Category Updates
 * Receives collection catalog updates from Shiprocket
 * Validates HMAC signature before processing
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📚 [Shiprocket Webhook] Collection update received');

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
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse collection data
    const collectionData = JSON.parse(body);
    console.log('✅ [Shiprocket Webhook] HMAC verified, processing collection:', collectionData.id);

    // TODO: Update collection in your database
    // This is where you would update Firestore or your category database
    // with the collection data from Shiprocket

    /*
    Example:
    const categoryRef = doc(db, 'categories', collectionData.id);
    await updateDoc(categoryRef, {
      name: collectionData.title,
      description: collectionData.body_html,
      image: collectionData.image?.src,
      updatedAt: new Date()
    });
    */

    console.log('✅ [Shiprocket Webhook] Collection processed successfully');

    return NextResponse.json({
      status: 'success',
      message: 'Collection update processed',
      collection_id: collectionData.id
    });
  } catch (error) {
    console.error('❌ [Shiprocket Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
