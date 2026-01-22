/**
 * Shiprocket Headless Checkout Utility
 * Handles order initialization and payment integration
 */

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

export interface OrderData {
  items: CartItem[];
  totalAmount: number;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

/**
 * Initialize Shiprocket checkout modal
 * This opens the Shiprocket checkout iframe/modal
 */
export function initiateShiprocketCheckout(options: any) {
  try {
    if (typeof window === 'undefined' || !window.ShiprocketCheckout) {
      throw new Error('Shiprocket Checkout SDK not loaded');
    }

    const srCheckout = new (window as any).ShiprocketCheckout(options);
    srCheckout.open();
  } catch (error) {
    console.error('Failed to initiate Shiprocket checkout:', error);
    throw error;
  }
}

/**
 * Format cart items for Shiprocket
 */
export function formatCartItemsForShiprocket(items: CartItem[]) {
  return items.map((item) => ({
    name: item.title,
    qty: item.quantity,
    price: item.price,
    sku: `${item.id}-${item.size || 'default'}-${item.color || 'default'}`,
    image: item.image || 'https://via.placeholder.com/300'
  }));
}

/**
 * Calculate total amount from cart items
 */
export function calculateTotalAmount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Create order in Shiprocket backend
 */
export async function createShiprocketOrderBackend(orderData: OrderData) {
  try {
    const response = await fetch('/api/shiprocket-create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        customerId: orderData.customerId,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
    throw error;
  }
}

/**
 * Process successful Shiprocket payment
 */
export async function processShiprocketPayment(
  paymentData: any,
  orderData: OrderData
) {
  try {
    const response = await fetch('/api/shiprocket-order-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentData,
        orderData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing Shiprocket payment:', error);
    throw error;
  }
}
