import { NextRequest, NextResponse } from 'next/server';

/**
 * COD Order Validation API
 * This endpoint validates order data before being written to Firestore.
 * The actual order is written by the authenticated frontend after guest user signin.
 */
export async function POST(req: NextRequest) {
  try {
    console.log('🔵 COD Order Validation API called');

    const body = await req.json();
    const { order } = body;

    console.log('📦 Received order data:', {
      userId: order?.userId,
      itemsCount: order?.items?.length,
      hasAddress: !!order?.address,
      amount: order?.amount,
    });

    // Validate required fields
    if (!order || !order.userId || !order.items || !order.address) {
      console.error('❌ Missing required fields in order');
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      console.error('❌ No items in order');
      return NextResponse.json(
        { success: false, error: 'Order must contain items' },
        { status: 400 }
      );
    }

    if (!order.address.firstName || !order.address.city || !order.address.state) {
      console.error('❌ Incomplete address');
      return NextResponse.json(
        { success: false, error: 'Address is incomplete' },
        { status: 400 }
      );
    }

    if (typeof order.amount !== 'number' || order.amount <= 0) {
      console.error('❌ Invalid order amount');
      return NextResponse.json(
        { success: false, error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    console.log('✅ Order validation successful');

    return NextResponse.json({
      success: true,
      message: 'Order validated. Ready to write to Firestore.',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error in COD order validation:', {
      message: error.message,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate COD order',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}