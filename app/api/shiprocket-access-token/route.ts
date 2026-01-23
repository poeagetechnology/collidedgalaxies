
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Helper function to generate HMAC signature
function generateHMAC(payload: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    // Hardcoded for local testing
    const apiKey = 'WqKyuY96wcTPKvaY';
    const secretKey = 'IHsXWv46qfyvTY7RJsuVKktoOIvbsN5t';
    const apiUrl = 'https://checkout-api.shiprocket.com/api/v1/access-token/checkout';

    if (!apiKey || !secretKey) {
      console.error('[Shiprocket API] Missing API credentials:', { apiKey, secretKey });
      return NextResponse.json({ error: 'Missing Shiprocket API credentials' }, { status: 500 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!body.cart_data || !body.redirect_url) {
      console.error('[Shiprocket API] Missing cart_data or redirect_url:', body);
      return NextResponse.json({ error: 'Missing cart_data or redirect_url' }, { status: 400 });
    }

    // Prepare payload as per Shiprocket docs
    const payload = {
      cart_data: body.cart_data,
      redirect_url: body.redirect_url,
      timestamp: new Date().toISOString(),
    };
    const payloadString = JSON.stringify(payload);
    const hmacSignature = generateHMAC(payloadString, secretKey);
    console.log('[Shiprocket API] Outgoing payload:', payload);
    console.log('[Shiprocket API] Outgoing headers:', {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-HMAC-SHA256': hmacSignature,
    });

    // Call Shiprocket Checkout API
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          'X-Api-HMAC-SHA256': hmacSignature,
        },
        body: payloadString,
      });
      console.log('[Shiprocket API] Shiprocket API status:', response.status);
    } catch (fetchError) {
      console.error('[Shiprocket API] Network error:', fetchError);
      return NextResponse.json({ error: 'Network error: Failed to reach Shiprocket API', details: String(fetchError) }, { status: 503 });
    }

    let data: any;
    try {
      data = await response.json();
      console.log('[Shiprocket API] Shiprocket API response:', data);
    } catch (parseErr) {
      console.error('[Shiprocket API] Failed to parse Shiprocket response:', parseErr);
      return NextResponse.json({ error: 'Failed to parse Shiprocket response' }, { status: 502 });
    }

    if (!response.ok) {
      console.error('[Shiprocket API] Shiprocket API error:', data);
      return NextResponse.json({ error: data.error || data.message || 'Shiprocket API error', details: data }, { status: response.status });
    }

    // Return only the token and order_id as per docs
    return NextResponse.json({
      token: data.data?.token || data.token,
      order_id: data.data?.order_id || data.order_id,
      expires_in: data.data?.expires_in || 3600
    });
  } catch (error: any) {
    console.error('[Shiprocket API] Internal server error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
