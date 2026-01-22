'use client';

import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ShiprocketHeadlessCheckoutProps {
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

export default function ShiprocketHeadlessCheckout({
  cartItems,
  onSuccess,
  onCancel,
  onError,
  className = 'w-full bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition font-semibold',
  buttonText = 'Checkout with Shiprocket'
}: ShiprocketHeadlessCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShiprocketCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const sellerId = process.env.NEXT_PUBLIC_SHIPROCKET_SELLER_ID;
      
      if (!sellerId) {
        console.error('Seller ID not configured');
        toast.error('Checkout configuration error. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

      // Format items for Shiprocket
      const items = cartItems.map((item) => ({
        name: item.title,
        qty: item.quantity,
        price: Number(item.price),
        sku: `${item.id}-${item.size || 'default'}-${item.color || 'default'}`,
        image: item.image || 'https://via.placeholder.com/300'
      }));

      console.log('🛒 [Shiprocket] Creating order with items:', items);

      // Call backend API to create Shiprocket checkout session
      const response = await fetch('/api/shiprocket-headless-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          total_amount: Math.round(totalAmount),
          seller_id: sellerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('✅ Order created:', data);

      // Open Shiprocket checkout URL
      if (data.checkout_url) {
        console.log('🔗 Redirecting to Shiprocket checkout:', data.checkout_url);
        window.open(data.checkout_url, '_blank');
        onSuccess?.(data);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Checkout failed');
      console.error('❌ Checkout error:', err);
      toast.error(err.message || 'Failed to initiate checkout');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-6 sm:p-8 flex flex-col bg-white">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h2>
        <p className="text-gray-600 mt-2">Complete your purchase with Shiprocket</p>
      </div>

      {/* Order Summary */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-3">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-start py-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && ' • '}
                  {item.color && `Color: ${item.color}`}
                </p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">
                ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-lg font-bold text-gray-900">Total Amount:</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="mt-auto">
        <button
          onClick={handleShiprocketCheckout}
          disabled={isLoading || cartItems.length === 0}
          className={`${className} block mx-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            buttonText
          )}
        </button>
        <p className="text-center text-xs text-gray-500 mt-4">
          You will be redirected to Shiprocket to complete your payment
        </p>
      </div>
    </div>
  );
}
