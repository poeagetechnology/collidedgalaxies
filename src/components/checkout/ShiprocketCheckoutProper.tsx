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
  shiprocketToken?: string | null;
  shiprocketOrderId?: string | null;
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
  shiprocketToken,
  shiprocketOrderId,
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
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📚 [Shiprocket SDK] STEP 0: Loading Shiprocket SDK');
    console.log('═══════════════════════════════════════════════════════════');
    
    const script = document.createElement('script');
    script.src = 'https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js';
    script.async = true;
    
    console.log('Script URL:', script.src);
    console.log('Script async:', script.async);

    script.onload = () => {
      console.log('✅ [Shiprocket SDK] Script loaded successfully');
      console.log('window.HeadlessCheckout available:', typeof window.HeadlessCheckout);
      if (window.HeadlessCheckout) {
        console.log('HeadlessCheckout methods:', Object.keys(window.HeadlessCheckout));
      }
      setSdkLoaded(true);
    };

    script.onerror = () => {
      console.error('❌ [Shiprocket SDK] Failed to load script');
      console.error('Script src:', script.src);
      toast.error('Failed to load checkout SDK');
    };

    document.head.appendChild(script);
    console.log('✅ [Shiprocket SDK] Script tag appended to document head');

    return () => {
      if (document.head.contains(script)) {
        console.log('🧹 [Shiprocket SDK] Cleaning up script tag');
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCheckout = async (event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('🚩 [Shiprocket Checkout] handleCheckout called');
      // Extra debug: log cart items and request payload
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔍 [Shiprocket Checkout] DEBUG: About to format cart items and prepare request');
      console.log('Cart Items:', cartItems);
      console.log('═══════════════════════════════════════════════════════════');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 [Shiprocket Checkout] STEP 1: Starting checkout process');
    console.log('═══════════════════════════════════════════════════════════');

    // Step 1: Validate cart
    if (cartItems.length === 0) {
      console.error('[Shiprocket Checkout] Cart is empty');
      toast.error('Your cart is empty');
      return;
    }
    // Step 2: Validate SDK
    if (!sdkLoaded) {
      console.error('[Shiprocket Checkout] SDK not loaded');
      toast.error('Checkout SDK not loaded. Please try again.');
      return;
    }
    setIsLoading(true);
    try {
      // If token is provided as prop, use it directly
      if (shiprocketToken) {
        // Step 6: Check Shiprocket SDK
        if (!window.HeadlessCheckout || typeof window.HeadlessCheckout.addToCart !== 'function') {
          console.error('[Shiprocket Checkout] SDK addToCart method not available');
          throw new Error('Shiprocket SDK not properly initialized. addToCart method not found.');
        }
        window.HeadlessCheckout.addToCart(event, shiprocketToken, {
          fallbackUrl: `${window.location.origin}/success?payment_gateway=shiprocket`
        });
        onSuccess?.({
          token: shiprocketToken,
          order_id: shiprocketOrderId,
          status: 'initiated'
        });
        return;
      }
      // ...existing code for fallback (should not be hit in new flow)...
      toast.error('No Shiprocket token provided.');
      onError?.(new Error('No Shiprocket token provided.'));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Checkout failed');
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
      type="button"
    >
      {isLoading ? 'Loading...' : buttonText}
    </button>
  );
}
