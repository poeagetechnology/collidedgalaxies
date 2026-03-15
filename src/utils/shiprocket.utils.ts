/**
 * Shiprocket Checkout Integration Utilities
 */

export interface CartItem {
  variant_id: string;
  quantity: number;
}

export interface ShiprocketCheckoutPayload {
  cart_data: {
    items: CartItem[];
  };
  redirect_url: string;
}

/**
 * Generate access token for Shiprocket checkout
 * @param items - Cart items with variant_id and quantity
 * @param redirectUrl - URL to redirect after checkout
 * @returns Access token and order details
 */
export async function generateShiprocketAccessToken(
  items: CartItem[],
  redirectUrl: string
): Promise<{
  token: string;
  order_id: string;
  expires_in: number;
}> {
  try {
    const payload: ShiprocketCheckoutPayload = {
      cart_data: { items },
      redirect_url: redirectUrl
    };

    const response = await fetch('/api/shiprocket-access-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate access token';
      try {
        const error = await response.json();
        errorMessage = error.error || error.details || errorMessage;
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return {
      token: data.token,
      order_id: data.order_id,
      expires_in: data.expires_in
    };
  } catch (error) {
    console.error('❌ [Client] Error generating Shiprocket token:', error);
    throw error;
  }
}

/**
 * Initiate Shiprocket checkout
 * @param token - Access token from generateShiprocketAccessToken
 * @param fallbackUrl - Fallback URL if checkout fails
 */
export function initiateShiprocketCheckout(
  token: string,
  fallbackUrl: string
): void {
  try {
    // Access the global Shiprocket checkout function
    const HeadlessCheckout = (window as any).HeadlessCheckout;
    
    if (!HeadlessCheckout) {
      console.error('Shiprocket checkout script not loaded');
      throw new Error('Shiprocket checkout is not available');
    }

    // Create a synthetic click event
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    // Trigger the checkout
    HeadlessCheckout.addToCart(event, token, {
      fallbackUrl: fallbackUrl
    });
  } catch (error) {
    console.error('Error initiating Shiprocket checkout:', error);
    throw error;
  }
}

/**
 * Build cart items from product data
 * @param products - Array of products with quantity and variant info
 * @returns Formatted cart items for Shiprocket
 */
export function buildCartItems(
  products: Array<{
    id: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }>
): CartItem[] {
  return products.map((product) => ({
    variant_id: `${product.id}-${product.selectedColor || 'default'}-${product.selectedSize || 'M'}`,
    quantity: product.quantity
  }));
}

/**
 * Format product data for Shiprocket catalog
 */
export function formatProductForShiprocket(product: any) {
  return {
    id: product.id,
    title: product.title || '',
    body_html: product.description || '',
    vendor: 'CollidedGalaxies',
    product_type: product.category || 'Apparel',
    updated_at: new Date().toISOString(),
    status: 'active',
    variants: (product.variants || []).map((variant: any, idx: number) => ({
      id: `${product.id}-${idx}`,
      title: variant.color || 'Default',
      price: product.discountPriceFirst10Days || product.originalPrice || '0',
      quantity: variant.quantity || 10,
      sku: variant.sku || `${product.id}-${idx}`,
      updated_at: new Date().toISOString(),
      image: {
        src: product.image || product.images?.[0] || ''
      },
      weight: 0.5
    })),
    image: {
      src: product.image || product.images?.[0] || ''
    }
  };
}
