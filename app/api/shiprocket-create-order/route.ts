import { NextRequest, NextResponse } from 'next/server';

interface OrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  tax?: number;
  discount?: number;
}

interface CreateOrderRequest {
  token: string;
  order_id: string;
  product: {
    name: string;
    sku: string;
    price: number;
    quantity: number;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  pickup_location: string;
}

/**
 * Shiprocket Create Order API
 * Creates a custom order in Shiprocket
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Shiprocket Order] Creating new order');

    const body: CreateOrderRequest = await request.json();
    const { token, order_id, product, customer, pickup_location } = body;

    if (!token || !order_id || !product || !customer) {
      console.error('❌ [Shiprocket Order] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare order items
    const order_items: OrderItem[] = [
      {
        name: product.name,
        sku: product.sku || 'default-sku',
        units: product.quantity,
        selling_price: product.price,
        tax: 0,
        discount: 0
      }
    ];

    // Calculate totals
    const sub_total = product.price * product.quantity;

    // Prepare order payload
    const orderPayload = {
      order_id: order_id,
      order_date: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0],
      pickup_location: pickup_location || 'Default',
      billing_customer_name: customer.name,
      billing_last_name: '',
      billing_address: customer.address,
      billing_address_2: '',
      billing_city: customer.city,
      billing_pincode: customer.pincode,
      billing_state: customer.state,
      billing_country: customer.country || 'India',
      billing_email: customer.email,
      billing_phone: customer.phone,
      shipping_is_billing: true,
      order_items: order_items,
      payment_method: 'COD',
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: sub_total,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1
    };

    console.log('📦 [Shiprocket Order] Payload:', JSON.stringify(orderPayload, null, 2));

    // Call Shiprocket create order API
    const createOrderResponse = await fetch(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      }
    );

    if (!createOrderResponse.ok) {
      const errorData = await createOrderResponse.text();
      console.error('❌ [Shiprocket Order] Order creation failed:', createOrderResponse.status, errorData);
      return NextResponse.json(
        { error: 'Order creation failed', details: errorData },
        { status: createOrderResponse.status }
      );
    }

    const orderData = await createOrderResponse.json();
    console.log('✅ [Shiprocket Order] Order created successfully:', orderData);

    return NextResponse.json({
      success: true,
      order_id: orderData.order_id,
      shipment_id: orderData.shipment_id,
      status: orderData.status,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('❌ [Shiprocket Order] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
