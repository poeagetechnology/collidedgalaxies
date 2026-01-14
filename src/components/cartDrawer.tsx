'use client';
import { useCart, CartItem } from '@/src/context/CartContext';
import { toast } from 'react-hot-toast';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, incrementQuantity, decrementQuantity } = useCart();
  const router = useRouter();

  const subtotal = cartItems.reduce(
    (sum, item: any) => sum + ((item.price || 0) * (item.quantity || 0)),
    0
  );

  const getColorDisplay = (color: any): string => {
    if (!color) return 'N/A';
    if (typeof color === 'object' && color.name) return color.name;
    if (typeof color === 'string') return color;
    return 'N/A';
  };

  return (
    <>
      {isCartOpen && (
        <div
          className="fixed inset-0 backdrop-blur-xs bg-black/20 z-80"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-sm md:max-w-[420px] z-100 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Close button */}
        <button
          className="absolute right-3 sm:right-6 top-4 sm:top-6 text-2xl sm:text-4xl cursor-pointer text-gray-600 hover:text-black"
          onClick={() => setIsCartOpen(false)}
        >
          ×
        </button>

        {/* Header */}
        <div className="pb-4 pt-16 sm:pt-24 px-3 sm:px-6 font-semibold text-lg sm:text-2xl">
          Your Cart <span className="text-sm font-normal">({cartItems.length})</span>
        </div>

        {/* Main Section */}
        <div className="flex flex-col justify-between h-[calc(100%-8rem)] sm:h-[calc(100%-9rem)] overflow-y-scroll px-3 sm:px-6 scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="flex flex-col flex-1 justify-center items-center text-gray-500 text-sm">
              <p className="text-black text-xl">Your Cart is Empty</p>
              <p>Add some items to your cart.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item: CartItem, index: number) => {
                return (
                  <div
                    key={item.uniqueKey || `item-${index}`}
                    className="flex flex-row items-stretch gap-4 border-b border-gray-200 pb-4"
                  >
                    <Image
                      src={item.image || "/placeholder.jpg"}
                      alt={item.title || "Product image"}
                      width={80}
                      height={96}
                      className="w-20 h-24 object-cover"
                    />

                    <div className="flex flex-row w-full items-center justify-between">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 text-base">{item.title}</h3>
                          <p className="text-sm text-gray-500">
                            {item.size || 'N/A'} | {getColorDisplay(item.color)}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">₹{item.price ?? 0}</p>
                      </div>

                      <div className="flex flex-col items-end h-full justify-between">
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-gray-400 cursor-pointer"
                        >
                          <Image src="/Trash.svg" alt="Remove" width={18} height={18} />
                        </button>

                        <div className="flex bg-gray-100 px-3 py-1">
                          <button
                            onClick={() => decrementQuantity(index)}
                            className="text-gray-800 cursor-pointer text-lg font-medium px-1"
                          >
                            –
                          </button>
                          <span className="px-3">{item.quantity}</span>
                          <button
                            onClick={() => incrementQuantity(index)}
                            className="text-gray-800 cursor-pointer text-lg font-medium px-1"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom section */}
          <div className="sticky bottom-0 bg-white py-3 sm:py-4 mt-4">
            <div className="flex justify-between text-sm sm:text-base pt-2 pb-4 sm:pb-6">
              <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
              <span className='text-base sm:text-xl font-semibold'>₹{subtotal.toFixed(2)}</span>
            </div>

            {cartItems.length > 0 ? (
              <>
                <button
                  className="w-full py-2 cursor-pointer bg-black text-white font-semibold text-sm sm:text-base hover:bg-gray-800 mb-2"
                  onClick={() => { setIsCartOpen(false); router.push('/cart'); }}
                >
                  Go to Cart
                </button>
                <button
                  className="w-full py-2 cursor-pointer bg-blue-600 text-white font-semibold text-sm sm:text-base hover:bg-blue-700 mb-2"
                  onClick={() => {
                    router.push('/checkout');
                    setIsCartOpen(false);
                  }}
                >
                  Continue to Checkout
                </button>
              </>
            ) : null}

            <button
              className="w-full py-2 border cursor-pointer border-black font-semibold text-sm sm:text-base hover:bg-gray-100"
              onClick={() => { setIsCartOpen(false); router.push("/products") }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}