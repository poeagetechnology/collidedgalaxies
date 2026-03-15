'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Success() {
  const [isCOD, setIsCOD] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentParam = params.get('payment');
    const paymentId = params.get('payment_id');
    const orderId = params.get('order_id');

    console.log('📋 Success page params:', { paymentParam, paymentId, orderId });

    // Check if this is a COD order
    if (paymentParam === 'cod') {
      console.log('✅ COD Order detected');
      setIsCOD(true);
      setIsPaymentSuccess(false);

      // Track Purchase event for COD
      if (typeof window !== 'undefined' && (window as any).fbq) {
        const pendingOrder = sessionStorage.getItem('pendingOrder');
        const orderData = pendingOrder ? JSON.parse(pendingOrder) : {};
        (window as any).fbq('track', 'Purchase', {
          value: orderData.amount || 0,
          currency: 'INR',
          content_type: 'product',
          content_name: 'Order',
        });
      }
    }
    // Check if this is a Razorpay payment success
    else if (paymentId && orderId) {
      console.log('✅ Razorpay Payment Success detected');
      setIsCOD(false);
      setIsPaymentSuccess(true);

      // Track Purchase event for Online Payment
      if (typeof window !== 'undefined' && (window as any).fbq) {
        const pendingOrder = sessionStorage.getItem('pendingOrder');
        const orderData = pendingOrder ? JSON.parse(pendingOrder) : {};
        (window as any).fbq('track', 'Purchase', {
          value: orderData.amount || 0,
          currency: 'INR',
          content_type: 'product',
          content_name: 'Order',
        });
      }
    }
    // Invalid URL - redirect to home
    else {
      console.warn('⚠️ No valid payment parameters found. Redirecting to home...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Green Circle with Tick */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="green"
          className="w-10 h-10 rotate-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold mt-6 text-black">
        {isCOD ? 'Order Placed Successfully!' : 'Payment Successful! 🎉'}
      </h1>

      <p className="text-gray-600 mt-3 max-w-md">
        {isCOD 
          ? 'Your order has been confirmed! Please keep cash ready for payment on delivery.'
          : 'Thank you for your payment. Your order is being processed.'
        }
      </p>

      {/* Payment Method */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
        <p className="text-lg font-semibold text-black">
          {isCOD ? '💳 Cash on Delivery (COD)' : '💰 Online Payment (Razorpay)'}
        </p>
      </div>

      {isCOD && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Important:</strong> Our delivery partner will contact you soon. Please confirm your address and keep the exact amount ready.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 mt-16 flex-wrap justify-center">
        <a
          href="/my-orders"
          className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition font-semibold"
        >
          View My Orders
        </a>
        <a 
          href="/products"
          className="border-2 border-black text-black px-8 py-3 hover:bg-gray-100 transition font-semibold"
        >
          Continue Shopping
        </a>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-gray-500 mt-12">
        Order confirmation has been sent to your email.
      </p>
    </div>
  );
}