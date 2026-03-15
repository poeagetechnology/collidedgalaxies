import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [Direct Buy API] Received request');
    
    const body = await request.json();
    console.log('📦 [Direct Buy API] Request body:', JSON.stringify(body, null, 2));
    
    const { userId, productId, productTitle, price, quantity, size, color, userEmail } = body;

    // Validate required fields
    if (!productId || !quantity || !size) {
      console.error('❌ [Direct Buy API] Missing required fields:', { productId, quantity, size, color });
      return NextResponse.json(
        { error: 'Missing required fields: productId, quantity, size are required' },
        { status: 400 }
      );
    }

    // Validate color
    if (!color) {
      console.error('❌ [Direct Buy API] Color is missing');
      return NextResponse.json(
        { error: 'Please select a color' },
        { status: 400 }
      );
    }

    // Ensure price is a number
    const finalPrice = typeof price === 'number' ? price : parseFloat(price) || 0;
    const finalQuantity = typeof quantity === 'number' ? quantity : parseInt(quantity) || 1;

    console.log('✅ [Direct Buy API] Validation passed');

    // Generate a unique direct buy ID
    const directBuyId = `db_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const dataToSave = {
      id: directBuyId,
      userId: userId || 'guest',
      productId: String(productId),
      productTitle: productTitle || 'Unknown Product',
      price: finalPrice,
      quantity: finalQuantity,
      size: String(size),
      color: typeof color === 'object' ? (color.hex || color.name || String(color)) : String(color),
      userEmail: userEmail || 'not-provided',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('📌 [Direct Buy API] Generated direct buy ID:', directBuyId);
    console.log('✅ [Direct Buy API] Data prepared:', JSON.stringify(dataToSave, null, 2));

    // Return success with the direct buy ID
    // The actual Firestore saving will happen after payment completion
    return NextResponse.json(
      {
        success: true,
        message: 'Direct buy initialized successfully',
        directBuyId: directBuyId,
        data: dataToSave,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ [Direct Buy API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [Direct Buy API] Error details:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to process direct buy',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
