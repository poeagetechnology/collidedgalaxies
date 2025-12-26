import { db } from '@/firebase-server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, productTitle, price, quantity, size, color, userEmail } = body;

    if (!productId || !quantity || !size || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store direct buy data in Firestore
    const directBuysRef = collection(db, 'directBuys');
    const docRef = await addDoc(directBuysRef, {
      userId: userId || 'guest',
      productId,
      productTitle,
      price,
      quantity,
      size,
      color: typeof color === 'object' ? color.hex || color.name : color,
      userEmail: userEmail || 'not-provided',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Direct buy recorded successfully',
        directBuyId: docRef.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording direct buy:', error);
    return NextResponse.json(
      { error: 'Failed to record direct buy' },
      { status: 500 }
    );
  }
}
