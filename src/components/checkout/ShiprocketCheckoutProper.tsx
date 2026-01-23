'use client';

import React, { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ShiprocketCheckoutProps {
  cartItems: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
    color?: string;
  }>;
  onSuccess?: (response: any) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
  className?: string;
  buttonText?: string;
}

declare global {
  interface Window {
    HeadlessCheckout?: any;
  }
}

export default function ShiprocketCheckoutProper({
  cartItems,
  onSuccess,
  onCancel,
  onError,
  className = 'w-full bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition font-semibold',
  buttonText = 'Checkout with Shiprocket'
}: ShiprocketCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load Shiprocket SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ [Shiprocket SDK] Loaded successfully');
      setSdkLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ [Shiprocket SDK] Failed to load');
      toast.error('Failed to load checkout SDK');
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!sdkLoaded) {
      toast.error('Checkout SDK not loaded. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🛒 [Shiprocket Checkout] Initiating checkout with items:', cartItems);

      // Format cart items for Shiprocket API
      const formattedItems = cartItems.map((item) => ({
        variant_id: `${item.id}-${item.color || 'default'}-${item.size || 'M'}`.toLowerCase().replace(/\s+/g, '-'),
        quantity: item.quantity
      }));

      console.log('📦 [Shiprocket Checkout] Formatted items:', formattedItems);

      // Get redirect URL (success page)
      const redirectUrl = `${window.location.origin}/success?payment_gateway=shiprocket`;

      // Call backend to generate access token
      console.log('🔑 [Shiprocket Checkout] Requesting access token...');
      const tokenResponse = await fetch('/api/shiprocket-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_data: {
            items: formattedItems
          },
          redirect_url: redirectUrl,
          timestamp: new Date().toISOString()
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.error || 'Failed to generate access token');
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ [Shiprocket Checkout] Access token received');

      if (!tokenData.token) {
        throw new Error('No access token received');
      }

      // Use Shiprocket SDK to open checkout
      console.log('🛒 [Shiprocket Checkout] Opening checkout modal with token');
      
      if (window.HeadlessCheckout && typeof window.HeadlessCheckout.addToCart === 'function') {
        const event = new Event('click');
        window.HeadlessCheckout.addToCart(event, tokenData.token, {
          fallbackUrl: redirectUrl
        });
        
        console.log('✅ [Shiprocket Checkout] Checkout opened successfully');
        onSuccess?.({
          token: tokenData.token,
          order_id: tokenData.order_id,
          status: 'initiated'
        });
      } else {
        throw new Error('Shiprocket SDK not properly initialized');
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Checkout failed');
      console.error('❌ [Shiprocket Checkout] Error:', err);
      toast.error(err.message || 'Failed to initiate checkout');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading || cartItems.length === 0}
      className={`${className} ${isLoading || cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? 'Loading...' : buttonText}
    </button>
  );
}
