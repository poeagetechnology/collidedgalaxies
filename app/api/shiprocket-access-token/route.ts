import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface CartItem {
  variant_id: string;
  quantity: number;
}

interface RequestBody {
  cart_data: {
    items: CartItem[];
  };
  redirect_url: string;
}

// Helper function to generate HMAC signature
function generateHMAC(payload: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Shiprocket] Received token request');
    
    const apiKey = process.env.NEXT_PUBLIC_SHIPROCKET_API_KEY;
    const secretKey = process.env.SHIPROCKET_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_SHIPROCKET_BASE_URL || 'https://checkout-api.shiprocket.com';

    console.log('🔑 [Shiprocket] Credentials check:', {
      hasApiKey: !!apiKey,
      hasSecretKey: !!secretKey,
      baseUrl
    });

    if (!apiKey || !secretKey) {
      console.error('❌ [Shiprocket] Missing API credentials');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Shiprocket credentials' },
        { status: 500 }
      );
    }

    let body: RequestBody;
    try {
      body = await request.json();
      console.log('📦 [Shiprocket] Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ [Shiprocket] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Generate timestamp in ISO 8601 format (required by Shiprocket)
    const timestamp = new Date().toISOString();

    // Prepare the payload - EXACT order matters for signature
    const payload = {
      cart_data: body.cart_data,
      redirect_url: body.redirect_url,
      timestamp: timestamp
    };

    const payloadString = JSON.stringify(payload);
    console.log('📝 [Shiprocket] Payload string:', payloadString);
    
    let hmacSignature: string;
    try {
      hmacSignature = generateHMAC(payloadString, secretKey);
      console.log('✅ [Shiprocket] HMAC generated:', hmacSignature.substring(0, 20) + '...');
    } catch (hmacError) {
      console.error('❌ [Shiprocket] HMAC generation failed:', hmacError);
      return NextResponse.json(
        { error: 'Failed to generate signature' },
        { status: 500 }
      );
    }

    const apiUrl = `${baseUrl}/api/v1/access-token/checkout`;
    console.log('📡 [Shiprocket] Making API call to:', apiUrl);
    
    // Correct headers per documentation: X-Api-Key (no Bearer), and HMAC
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-HMAC-SHA256': hmacSignature
    };
    
    console.log('📡 [Shiprocket] Request Headers:', {
      'X-Api-Key': apiKey.substring(0, 5) + '...',
      'X-Api-HMAC-SHA256': hmacSignature.substring(0, 20) + '...',
      'Timestamp in payload': timestamp
    });
    console.log('📝 [Shiprocket] Payload being sent:', payloadString);

    // Call Shiprocket API
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: payloadString
      });
      console.log('📨 [Shiprocket] API response status:', response.status);
    } catch (fetchError) {
      console.error('❌ [Shiprocket] Network error:', fetchError);
      return NextResponse.json(
        { error: 'Network error: Failed to reach Shiprocket API', details: String(fetchError) },
        { status: 503 }
      );
    }

    const responseText = await response.text();
    console.log('📨 [Shiprocket] Full response:', {
      status: response.status,
      body: responseText
    });

    if (!response.ok) {
      console.error('❌ [Shiprocket] API error response:', response.status, responseText);
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(
          { 
            error: 'Shiprocket API Error', 
            status: response.status,
            details: errorData 
          },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { 
            error: 'Shiprocket API Error', 
            status: response.status,
            details: responseText 
          },
          { status: response.status }
        );
      }
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [Shiprocket] Received data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ [Shiprocket] Failed to parse response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse Shiprocket response' },
        { status: 502 }
      );
    }

    const result = {
      success: true,
      token: data.data?.token || data.token,
      order_id: data.data?.order_id || data.order_id,
      expires_in: data.data?.expires_in || 3600
    };

    console.log('✅ [Shiprocket] Returning token:', result.token?.substring(0, 10) + '...');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ [Shiprocket] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate access token', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
