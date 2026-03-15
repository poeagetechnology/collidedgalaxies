import { NextRequest, NextResponse } from "next/server";

let Razorpay: any;

// Dynamically import Razorpay only when needed
async function getRazorpay() {
  if (!Razorpay) {
    try {
      const RazorpayModule = await import("razorpay");
      // Razorpay module exports default class
      Razorpay = RazorpayModule.default || RazorpayModule;
      console.log("[Razorpay API] Razorpay module loaded:", typeof Razorpay);
    } catch (error) {
      console.error("Failed to import Razorpay:", error);
      throw new Error("Razorpay SDK not available");
    }
  }
  return Razorpay;
}

export async function POST(req: NextRequest) {
  try {
    console.log("[Razorpay API] Received request");
    
    const body = await req.json();
    const { amount, customerId, customerEmail, customerPhone, orderId } = body;

    console.log("[Razorpay API] Amount received:", amount);

    if (!amount || amount <= 0) {
      console.error("[Razorpay API] Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount", amount },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log("[Razorpay API] Keys check - Key ID exists:", !!keyId, "Key Secret exists:", !!keySecret);

    if (!keyId || !keySecret) {
      console.error("[Razorpay API] Missing Razorpay credentials");
      return NextResponse.json(
        { error: "Payment gateway not configured", missingKeyId: !keyId, missingKeySecret: !keySecret },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://collidedgalaxies.com";

    console.log("[Razorpay API] Creating Razorpay Order...");

    // Get Razorpay instance
    const RazorpayClass = await getRazorpay();
    console.log("[Razorpay API] RazorpayClass type:", typeof RazorpayClass);
    
    // Razorpay SDK expects an object with key_id and key_secret
    const razorpay = new RazorpayClass({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log("[Razorpay API] Razorpay instance created successfully");

    // Create Razorpay Order
    // Generate a valid receipt: alphanumeric, max 40 chars, only letters, numbers, hyphens, underscores, periods
    const receiptId = `order-${Date.now()}`;
    
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: "INR",
      receipt: receiptId,
      payment_capture: 1, // Auto-capture payment
      notes: {
        customer_id: customerId || "guest",
        customer_email: customerEmail || "info@collidedgalaxies.com",
        customer_phone: customerPhone || "9000000000",
      },
    };

    console.log("[Razorpay API] Order Payload:", JSON.stringify(options, null, 2));

    const order = await razorpay.orders.create(options);

    console.log("[Razorpay API] Order created successfully:", order);

    if (!order.id) {
      console.error("[Razorpay API] No order ID in response:", order);
      throw new Error("Failed to create Razorpay order");
    }

    console.log("[Razorpay API] Order ID:", order.id);

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      customer_email: customerEmail || "info@collidedgalaxies.com",
      customer_phone: customerPhone || "9000000000",
      customerId: customerId || "guest",
      status: "success",
    });
  } catch (err) {
    console.error("[Razorpay API] Error:", err);
    
    // Extract detailed error information
    let errorMessage = "Error creating Razorpay order";
    let errorDetails = {};
    
    if (err instanceof Error) {
      errorMessage = err.message;
      errorDetails = {
        message: err.message,
        name: err.name,
        stack: err.stack?.split('\n').slice(0, 5).join(' | ') // First 5 stack frames
      };
    } else if (typeof err === 'object' && err !== null) {
      errorMessage = JSON.stringify(err);
      errorDetails = err;
    } else {
      errorMessage = String(err);
    }
    
    return NextResponse.json(
      { 
        error: "Error creating Razorpay order", 
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

