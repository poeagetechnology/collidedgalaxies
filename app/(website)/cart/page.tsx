'use client';

import { useCart, CartItem } from '@/src/context/CartContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, incrementQuantity, decrementQuantity } = useCart();
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Group combo products
  const comboStatus = useMemo(() => {
    const combos = cartItems.filter((item: CartItem) => (item as any).isCombo);
    const comboGrouped = combos.reduce((acc: Record<string, CartItem[]>, item: CartItem) => {
      const key = (item as any).comboKey || (item as any).productId || (item as any).id || (item as any).title || 'combo';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return Object.entries(comboGrouped).map(([comboId, items]: [string, CartItem[]]) => {
      const requiredSlots = items[0] ? (items[0] as any).comboQuantity || 3 : 3;
      const filledSlots = items.length;
      const isUnder = filledSlots < requiredSlots;
      return {
        comboId,
        requiredSlots,
        filledSlots,
        isUnder,
        slotsLeft: requiredSlots - filledSlots,
      };
    });
  }, [cartItems]);

  // Calculate prices
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum: number, item: CartItem) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const shipping = shippingMethod === 'express' ? 200 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    const underfilled = comboStatus.filter(cs => cs.isUnder);
    if (underfilled.length > 0) {
      const msg = underfilled.map(u => `${u.slotsLeft} more products to be added for combo`).join(' | ');
      toast.error(msg || 'Please complete combo requirements before checkout', {
        style: { borderRadius: 0 }
      });
      return;
    }
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">SHOPPING BAG</h1>
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
            <button
              onClick={() => router.push('/products')}
              className="inline-block bg-black text-white font-semibold py-3 px-8 hover:bg-gray-800"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">SHOPPING BAG</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Products */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item: CartItem) => (
                <div key={item.id || item.uniqueKey} className="flex gap-4 pb-6 border-b border-gray-200">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-32 h-40 relative bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title || 'Product'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-gray-600 text-sm">Product ID: {item.productId}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id as number)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Size and Color */}
                    <div className="flex gap-6 text-sm mb-4">
                      {item.size && (
                        <div>
                          <span className="text-gray-600">Size: </span>
                          <span className="font-medium">{item.size}</span>
                        </div>
                      )}
                      {item.color && (
                        <div>
                          <span className="text-gray-600">Color: </span>
                          <span className="font-medium">
                            {typeof item.color === 'string' 
                              ? item.color 
                              : (item.color as any)?.name || (item.color as any)?.hex || 'Selected'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex justify-between items-end">
                      <div className="text-xl font-semibold">
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decrementQuantity(item.id as number)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                        <button
                          onClick={() => incrementQuantity(item.id as number)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Combo Info */}
                    {(item as any).isCombo && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <p className="text-yellow-800">
                          Combo Product - {(item as any).comboQuantity || 3} items required
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gray-50 p-6 rounded">
              <h2 className="text-xl font-bold mb-6">ORDER SUMMARY</h2>

              {/* Shipping Method */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="font-semibold mb-3">Shipping Method</p>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 flex-1">Standard Shipping</span>
                    <span className="text-gray-600">FREE</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 flex-1">Express Shipping</span>
                    <span className="text-gray-600">₹200</span>
                  </label>
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Combo Warning */}
              {comboStatus.some(cs => cs.isUnder) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  <p className="font-semibold mb-1">Incomplete Combos</p>
                  {comboStatus.filter(cs => cs.isUnder).map(cs => (
                    <p key={cs.comboId}>{cs.slotsLeft} more items needed</p>
                  ))}
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white font-semibold py-3 hover:bg-gray-800 transition mb-3"
              >
                CONTINUE
              </button>

              {/* Continue Shopping */}
              <button
                onClick={() => router.push('/products')}
                className="w-full border-2 border-black text-black font-semibold py-3 hover:bg-gray-100 transition"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
