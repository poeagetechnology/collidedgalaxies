'use client';

import { useState, useEffect } from 'react';

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  // Test amount (₹1 for testing)
  const testAmount = 1;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const openPaymentPopup = (orderId: string) => {
    // This is handled by Razorpay checkout modal
  };

  const testRazorpayPayment = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('[Test] Starting Razorpay test payment...');

      // Call the razorpay-order API
      const res = await fetch('/api/razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: testAmount,
          customerId: 'test_customer_123',
          customerEmail: 'test@collidedgalaxies.com',
          customerPhone: '9876543210',
        }),
      });

      const data = await res.json();
      console.log('[Test] API Response:', data);

      setResponse(data);

      if (!res.ok) {
        setError(`API Error (${res.status}): ${data.error || data.message || 'Unknown error'}\n\nDetails: ${JSON.stringify(data.details || data, null, 2)}`);
        return;
      }

      // If we got an order ID, open Razorpay checkout
      if (data.order_id && data.key_id) {
        console.log('[Test] Order ID:', data.order_id);
        
        // Load Razorpay script and open checkout
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          // @ts-ignore
          const rzp = new window.Razorpay({
            key: data.key_id,
            order_id: data.order_id,
            amount: data.amount,
            currency: data.currency,
            name: 'Collided Galaxies',
            description: 'Test Payment',
            handler: function(response: any) {
              console.log('[Test] Payment successful:', response);
              setResponse({ ...data, paymentResponse: response });
            },
            prefill: {
              name: 'Test User',
              email: 'test@collidedgalaxies.com',
              contact: '9876543210'
            },
            theme: {
              color: '#000000'
            },
            modal: {
              ondismiss: () => {
                console.log('[Test] Payment cancelled');
                setError('Payment cancelled by user');
              }
            }
          });
          rzp.open();
        };
        document.body.appendChild(script);
      } else {
        setError('No order ID received from Razorpay');
      }
    } catch (err: any) {
      console.error('[Test] Error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Razorpay Payment Test</h1>
        <p className="text-gray-600 mb-8">Test page to verify Razorpay integration</p>

        {/* Test Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Test Amount:</strong> ₹{testAmount}</p>
            <p><strong>API Version:</strong> Razorpay v1</p>
            <p><strong>Base URL:</strong> https://api.razorpay.com</p>
            <p><strong>Checkout:</strong> https://checkout.razorpay.com</p>
            <p><strong>Return URL:</strong> {origin}/success</p>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Payment</h2>
          
          <div className="border p-4 rounded">
            <h3 className="font-medium mb-2">Test Razorpay Payment (₹1)</h3>
            <p className="text-sm text-gray-600 mb-3">
              Calls /api/razorpay-order to create a Razorpay order
            </p>
            <button
              onClick={testRazorpayPayment}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Test Payment ₹${testAmount}`}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h2>
            <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-wrap">{error}</pre>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ API Response</h2>
            <pre className="text-sm text-green-700 whitespace-pre-wrap overflow-wrap bg-white p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
            
            {/* Payment Link */}
            {response.payment_url && (
              <div className="mt-4">
                <p className="font-medium mb-2">Click below to open payment popup:</p>
                <button
                  onClick={() => openPaymentPopup(response.payment_url)}
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded font-medium hover:bg-green-700"
                >
                  → Open Payment Page (Popup)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">📋 Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Click &quot;Test Payment ₹1&quot; button above</li>
            <li>If successful, click &quot;Open Payment Page&quot; to go to Cashfree</li>
            <li>Use test card: 4111 1111 1111 1111, any future expiry, any CVV</li>
            <li>After payment, you will be redirected to /success page</li>
          </ol>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
