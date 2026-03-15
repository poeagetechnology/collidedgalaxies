import { NextRequest, NextResponse } from 'next/server';

/**
 * DEPRECATED: This endpoint is no longer needed
 * Guest access now uses Firestore client SDK directly via useGuestOrderAccess hook
 * No Firebase Admin SDK required
 */
export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'This endpoint is deprecated. Guest access now uses Firestore client SDK.'
    },
    { status: 410 } // 410 Gone
  );
}

