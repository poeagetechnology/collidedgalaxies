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

    // Hardcoded credentials
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const apiVersion = "2023-08-01";

    console.log("[Cashfree API] Keys check - AppID exists:", !!appId, "Secret exists:", !!secretKey);

    if (!appId || !secretKey) {
      console.error("[Cashfree API] Missing Cashfree credentials");
      return NextResponse.json(
        { error: "Payment gateway not configured", missingAppId: !appId, missingSecretKey: !secretKey },
        { status: 500 }
      );
    }

    // Generate unique link ID
    const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = "https://collidedgalaxies.com";

    console.log("[Cashfree API] Creating Cashfree Payment Link...");

    // Create Payment Link using Payment Links API (simpler, no S2S required)
    const linkUrl = "https://api.cashfree.com/pg/links";

    const linkPayload = {
      link_id: linkId,
      link_amount: Number(amount),
      link_currency: "INR",
      link_purpose: "Order Payment",
      customer_details: {
        customer_id: customerId || `cust_${Date.now()}`,
        customer_email: customerEmail || "info@collidedgalaxies.com",
        customer_phone: customerPhone || "9000000000",
        customer_name: "Valued Customer",
      },
      link_meta: {
        return_url: `${baseUrl}/success`,
        notify_url: `${baseUrl}/api/cashfree-webhook`,
        upi_intent: false,
      },
      link_notify: {
        send_email: true,
        send_sms: false,
      },
      link_auto_reminders: true,
    };

    console.log("[Cashfree API] Link Payload:", JSON.stringify(linkPayload, null, 2));

    const linkResponse = await axios.post(linkUrl, linkPayload, {
      headers: {
        "x-api-version": apiVersion,
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "Content-Type": "application/json",
      },
    });

    console.log("[Cashfree API] Payment link created successfully:", linkResponse.data);

    const { cf_link_id, link_url: paymentUrl } = linkResponse.data;

    if (!paymentUrl) {
      console.error("[Cashfree API] No payment link URL in response:", linkResponse.data);
      throw new Error("No payment link URL returned from Cashfree");
    }

    console.log("[Cashfree API] Payment Link URL:", paymentUrl);

    return NextResponse.json({
      link_id: linkId,
      cf_link_id: cf_link_id,
      payment_url: paymentUrl,
      status: "success",
    });
  } catch (err) {
    console.error("[Cashfree API] Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorData = (err as any)?.response?.data;
    
    return NextResponse.json(
      { 
        error: "Error creating Cashfree payment link", 
        message: errorMessage,
        details: errorData || (err instanceof Error ? err.toString() : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
