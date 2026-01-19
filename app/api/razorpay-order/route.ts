import { NextRequest, NextResponse } from "next/server";

/**
 * DEPRECATED: This endpoint is no longer used
 * The application has migrated to Cashfree Payment Gateway
 * Use /api/cashfree-order instead
 */
export async function POST(req: NextRequest) {
  console.warn("[Razorpay API] DEPRECATED - This endpoint is no longer available");
  return NextResponse.json(
    { 
      error: "Razorpay integration has been deprecated",
      message: "Please use /api/cashfree-order instead",
      status: "deprecated"
    },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
}
