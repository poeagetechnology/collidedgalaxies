import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[Razorpay API] Received request");
    
    const body = await req.json();
    const { amount } = body;

    console.log("[Razorpay API] Amount received:", amount);

    if (!amount || amount <= 0) {
      console.error("[Razorpay API] Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount", amount },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log("[Razorpay API] Keys check - ID exists:", !!keyId, "Secret exists:", !!keySecret);

    if (!keyId || !keySecret) {
      console.error("[Razorpay API] Missing Razorpay credentials");
      return NextResponse.json(
        { error: "Payment gateway not configured", missingKeyId: !keyId, missingKeySecret: !keySecret },
        { status: 500 }
      );
    }

    console.log("[Razorpay API] Creating Razorpay instance...");
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(amount * 100);
    console.log("[Razorpay API] Creating order with amount (paise):", amountInPaise);

    const order = await instance.orders.create({
      amount: amountInPaise,
      currency: "INR",
    });

    console.log("[Razorpay API] Order created successfully:", order.id);
    return NextResponse.json(order);
  } catch (err) {
    console.error("[Razorpay API] Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { 
        error: "Error creating Razorpay order", 
        message: errorMessage,
        details: err instanceof Error ? err.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
