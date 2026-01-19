import { NextRequest, NextResponse } from 'next/server';

/**
 * Shiprocket Authentication API
 * Generates auth token using email/password
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Shiprocket Auth] Generating authentication token');

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      console.error('❌ [Shiprocket Auth] Missing credentials in .env');
      return NextResponse.json(
        { error: 'Shiprocket credentials not configured' },
        { status: 500 }
      );
    }

    // Call Shiprocket authentication API
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.text();
      console.error('❌ [Shiprocket Auth] Authentication failed:', errorData);
      return NextResponse.json(
        { error: 'Authentication failed', details: errorData },
        { status: authResponse.status }
      );
    }

    const data = await authResponse.json();
    console.log('✅ [Shiprocket Auth] Token generated successfully');

    return NextResponse.json({
      success: true,
      token: data.token,
      expires_in: 86400
    });
  } catch (error) {
    console.error('❌ [Shiprocket Auth] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth token', details: String(error) },
      { status: 500 }
    );
  }
}
