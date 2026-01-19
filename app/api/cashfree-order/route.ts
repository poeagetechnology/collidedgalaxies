import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    console.log("[Cashfree API] Received request");
    
    const body = await req.json();
    const { amount, customerId, customerEmail, customerPhone } = body;

    console.log("[Cashfree API] Amount received:", amount);

    if (!amount || amount <= 0) {
      console.error("[Cashfree API] Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount", amount },
        { status: 400 }
      );
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const apiVersion = process.env.CASHFREE_API_VERSION || "2023-08-01";

    console.log("[Cashfree API] Keys check - AppID exists:", !!appId, "Secret exists:", !!secretKey);

    if (!appId || !secretKey) {
      console.error("[Cashfree API] Missing Cashfree credentials");
      return NextResponse.json(
        { error: "Payment gateway not configured", missingAppId: !appId, missingSecretKey: !secretKey },
        { status: 500 }
      );
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log("[Cashfree API] Creating Cashfree session...");

    // Create payment session with Cashfree
    const paymentSessionUrl = "https://api.cashfree.com/pg/orders";

    const payloadData = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: customerId || `cust_${Date.now()}`,
        customer_email: customerEmail || "info@collidedgalaxies.com",
        customer_phone: customerPhone || "9000000000",
      },
      order_meta: {
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cashfree-webhook`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cashfree-return`,
      },
      order_tags: {
        order_type: "web",
      },
    };

    console.log("[Cashfree API] Payload:", JSON.stringify(payloadData, null, 2));

    const response = await axios.post(paymentSessionUrl, payloadData, {
      headers: {
        "x-api-version": apiVersion,
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json",
      },
    });

    console.log("[Cashfree API] Session created successfully:", response.data);

    return NextResponse.json({
      ...response.data,
      orderId,
      status: "success",
    });
  } catch (err) {
    console.error("[Cashfree API] Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorData = (err as any)?.response?.data;
    
    return NextResponse.json(
      { 
        error: "Error creating Cashfree payment session", 
        message: errorMessage,
        details: errorData || (err instanceof Error ? err.toString() : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
