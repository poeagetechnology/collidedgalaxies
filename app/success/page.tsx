'use client';

import { Albert_Sans } from "next/font/google";
import { useEffect, useState } from "react";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Success() {
  const [isCOD, setIsCOD] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsCOD(params.get('payment') === 'cod');
  }, []);

  return (
    <div className={`h-screen flex flex-col items-center justify-center px-4 text-center ${albertSans.className}`}>
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

      <h1 className="text-3xl font-semibold mt-6">
        {isCOD ? 'Order Placed Successfully' : 'Payment Successful'}
      </h1>

      <p className="text-gray-600 mt-2">
        {isCOD 
          ? 'Your order has been confirmed. Please keep cash ready for payment on delivery.'
          : 'Thank you for your payment. Your order is being processed.'
        }
      </p>

      {/* Payment Method */}
      <p className="text-sm text-gray-500 mt-4">
        Payment Method: <span className="font-semibold text-black">
          {isCOD ? 'Cash on Delivery' : 'Online Payment'}
        </span>
      </p>

      {/* Buttons */}
      <div className="flex gap-4 mt-16">
        <a
          href="/my-orders"
          className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition"
        >
          View Orders
        </a>
        <a 
          href="/products"
          className="border-2 border-black text-black px-6 py-3 hover:bg-gray-100 transition"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}