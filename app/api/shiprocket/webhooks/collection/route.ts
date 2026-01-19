import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Helper function to verify HMAC signature
function verifyHMAC(
  payload: string,
  signature: string,
  secretKey: string
): boolean {
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64');
  return hmac === signature;
}

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.SHIPROCKET_SECRET_KEY;
    const apiKey = process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY;

    if (!secretKey || !apiKey) {
      console.error('Missing Shiprocket credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get the raw body to verify HMAC
    const body = await request.text();
    const signature = request.headers.get('X-Api-HMAC-SHA256');

    if (!signature || !verifyHMAC(body, signature, secretKey)) {
      console.error('Invalid HMAC signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Process collection update
    // In a real scenario, you would update your database here
    console.log('Collection webhook received:', {
      id: data.id,
      title: data.title,
      updated_at: data.updated_at
    });

    return NextResponse.json({
      success: true,
      message: 'Collection updated successfully'
    });
  } catch (error) {
    console.error('Error processing collection webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
