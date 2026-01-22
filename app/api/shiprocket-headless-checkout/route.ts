import { NextRequest, NextResponse } from 'next/server';

interface Item {
  name: string;
  qty: number;
  price: number;
  sku: string;
  image: string;
}

interface HeadlessCheckoutRequest {
  items: Item[];
  total_amount: number;
  seller_id: string;
}

/**
 * Shiprocket Headless Checkout API
 * Creates a checkout session and returns checkout URL
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🛒 [Shiprocket Headless] Creating checkout session');

    const body: HeadlessCheckoutRequest = await request.json();
    const { items, total_amount, seller_id } = body;

    if (!items || !seller_id) {
      console.error('❌ [Shiprocket Headless] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: items, seller_id' },
        { status: 400 }
      );
    }

    // Get Shiprocket access token from environment
    const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;

    if (!shiprocketEmail || !shiprocketPassword) {
      console.error('❌ [Shiprocket Headless] Missing Shiprocket credentials');
      return NextResponse.json(
        { error: 'Shiprocket credentials not configured' },
        { status: 500 }
      );
    }

    // Get access token
    console.log('🔐 [Shiprocket Headless] Getting access token...');
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error('❌ [Shiprocket Headless] Auth failed:', error);
      return NextResponse.json(
        { error: 'Authentication failed', details: error },
        { status: authResponse.status }
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;

    if (!token) {
      console.error('❌ [Shiprocket Headless] No token received');
      return NextResponse.json(
        { error: 'Failed to get authentication token' },
        { status: 500 }
      );
    }

    console.log('✅ [Shiprocket Headless] Token obtained');

    // Prepare order payload for Shiprocket
    const orderId = `COGA_${Date.now()}`;
    const now = new Date();
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const orderPayload = {
      order_id: orderId,
      order_date: orderDate,
      pickup_location: 'Default',
      billing_customer_name: 'Guest',
      billing_last_name: 'Customer',
      billing_address: 'To be provided at checkout',
      billing_city: 'India',
      billing_pincode: '000000',
      billing_state: 'NA',
      billing_country: 'India',
      billing_email: 'guest@collidedgalaxies.com',
      billing_phone: '9000000000',
      shipping_is_billing: true,
      order_items: items.map((item) => ({
        name: item.name,
        sku: item.sku,
        units: item.qty,
        selling_price: item.price,
        tax: 0,
        discount: 0,
      })),
      payment_method: 'Prepaid',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    };

    console.log('📦 [Shiprocket Headless] Creating order:', JSON.stringify(orderPayload, null, 2));

    // Create order in Shiprocket
    const createOrderResponse = await fetch(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (!createOrderResponse.ok) {
      const errorData = await createOrderResponse.text();
      console.error('❌ [Shiprocket Headless] Order creation failed:', createOrderResponse.status, errorData);
      return NextResponse.json(
        { error: 'Order creation failed', details: errorData },
        { status: createOrderResponse.status }
      );
    }

    const orderData = await createOrderResponse.json();
    console.log('✅ [Shiprocket Headless] Order created:', orderData);

    if (!orderData.order_id && !orderData.shipment_id) {
      console.error('❌ [Shiprocket Headless] Order created but no order/shipment ID returned:', orderData);
      return NextResponse.json(
        { error: 'Order created but missing order/shipment ID' },
        { status: 500 }
      );
    }

    // Build checkout URL with the order details
    const checkoutUrl = `https://checkout.shiprocket.in/?seller_id=${seller_id}&order_id=${orderData.order_id || orderId}`;

    console.log('🔗 [Shiprocket Headless] Generated checkout URL:', checkoutUrl);

    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
      order_id: orderData.order_id,
      shipment_id: orderData.shipment_id,
      message: 'Order created and checkout URL generated',
    });
  } catch (error) {
    console.error('❌ [Shiprocket Headless] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
