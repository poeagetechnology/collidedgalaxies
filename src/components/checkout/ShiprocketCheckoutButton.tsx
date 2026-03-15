'use client';

import React, { useState } from 'react';
import { generateShiprocketAccessToken, initiateShiprocketCheckout, CartItem } from '@/src/utils/shiprocket.utils';
import toast from 'react-hot-toast';

interface ShiprocketCheckoutButtonProps {
  cartItems: any[];
  userEmail: string;
  userPhone: string;
  onCheckoutStart?: () => void;
  onCheckoutError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function ShiprocketCheckoutButton({
  cartItems,
  userEmail,
  userPhone,
  onCheckoutStart,
  onCheckoutError,
  className = 'w-full bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition font-semibold',
  children = 'Continue to Shiprocket Checkout'
}: ShiprocketCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);
    onCheckoutStart?.();

    try {
      // Build cart items for Shiprocket
      const items: CartItem[] = cartItems.map((item) => ({
        variant_id: `${item.id}-${item.selectedColor || 'default'}-${item.selectedSize || 'M'}`,
        quantity: item.quantity || 1
      }));

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/success?payment_gateway=shiprocket`;

      // Generate access token
      const tokenData = await generateShiprocketAccessToken(items, redirectUrl);
      
      toast.success('Redirecting to Shiprocket Checkout...');

      // Initiate checkout
      initiateShiprocketCheckout(tokenData.token, `${baseUrl}/checkout`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Checkout failed');
      console.error('Shiprocket checkout error:', err);
      toast.error(err.message || 'Failed to initiate checkout');
      onCheckoutError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || cartItems.length === 0}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
