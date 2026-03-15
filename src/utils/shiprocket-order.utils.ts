import toast from 'react-hot-toast';

export interface ShiprocketCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface ShiprocketProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Create order on Shiprocket
 */
export async function createShiprocketOrder(
  product: ShiprocketProduct,
  customer: ShiprocketCustomer,
  pickupLocation: string = 'Default'
): Promise<{ order_id: string; shipment_id: string }> {
  try {
    // Step 1: Get authentication token
    const authResponse = await fetch('/api/shiprocket-auth', {
      method: 'POST'
    });

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(error.error || 'Failed to authenticate with Shiprocket');
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // Step 2: Create order
    const orderId = `ORDER-${product.id}-${Date.now()}`;

    const createOrderResponse = await fetch('/api/shiprocket-create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        order_id: orderId,
        product: {
          name: product.name,
          sku: product.id,
          price: product.price,
          quantity: product.quantity
        },
        customer: customer,
        pickup_location: pickupLocation
      })
    });

    if (!createOrderResponse.ok) {
      const error = await createOrderResponse.json();
      throw new Error(error.error || 'Failed to create order');
    }

    const orderData = await createOrderResponse.json();

    toast.success('Order created successfully! Redirecting...');

    return {
      order_id: orderData.order_id,
      shipment_id: orderData.shipment_id
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [Client] Error creating order:', errorMessage);
    throw error;
  }
}
