'use client';
import { useCart, CartItem } from '@/src/context/CartContext';
import { toast } from 'react-hot-toast';
import { Albert_Sans } from 'next/font/google';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700']
});

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, incrementQuantity, decrementQuantity } = useCart();
  const router = useRouter();

  // Subtotal will be computed later with combo offer handling
  let subtotal = 0;

  // ✅ Split items into combo vs regular
  const comboItems = cartItems.filter((item) => (item as any).isCombo);
  const regularItems = cartItems.filter((item) => !(item as any).isCombo);

  // Group combo items strictly by productId for capacity checks
  const comboLimitMap: Record<string, { required: number; total: number }> = {};
  comboItems.forEach((item: any) => {
    const key = item?.productId as string | undefined;
    if (!key) return; // skip if productId missing
    if (!comboLimitMap[key]) {
      comboLimitMap[key] = {
        required: Number.isFinite(item?.comboQuantity) ? item.comboQuantity : 0,
        total: 0,
      };
    }
    comboLimitMap[key].total += item.quantity || 0;
  });

  // ✅ Build combo status per combo group (support multiple combo types simultaneously)
  const getGroupKey = (item: any) => {
    return (
      (item as any).comboKey ||
      (item as any).productId ||
      (item as any).id ||
      (item as any).title ||
      'combo'
    );
  };

  const distinctComboKeys = Array.from(new Set(comboItems.map((item) => getGroupKey(item))));

  const comboStatus = distinctComboKeys.map((key) => {
    const items = comboItems.filter((item) => getGroupKey(item) === key);
    // Assume same comboQuantity across items in a group; guard when missing
    const requiredComboQtyRaw = (items[0] as any)?.comboQuantity ?? 0;
    const requiredComboQty = Number.isFinite(requiredComboQtyRaw) ? requiredComboQtyRaw : 0;
    const currentComboCount = items.reduce((sum, it) => sum + (it.quantity || 0), 0);
    const hasRequirement = requiredComboQty > 0;
    return {
      comboKey: key as string,
      requiredComboQty,
      currentComboCount,
      isFull: hasRequirement && currentComboCount >= requiredComboQty,
      isUnder: hasRequirement && currentComboCount < requiredComboQty,
      slotsLeft: hasRequirement ? Math.max(requiredComboQty - currentComboCount, 0) : 0,
    };
  });

  // Group combo items by their productId to calculate combo pricing
  const comboGroups: Record<string, { items: any[]; required: number; offerPrice: number; total: number }> = {};
  comboItems.forEach((item: any) => {
    const key = item?.productId as string | undefined;
    if (!key) return;
    if (!comboGroups[key]) {
      comboGroups[key] = {
        items: [],
        required: item?.comboQuantity ?? 0,
        offerPrice: item?.comboOfferPrice ?? 0, // expected from backend (e.g., Buy N @ offer price)
        total: 0,
      };
    }
    comboGroups[key].items.push(item);
    comboGroups[key].total += item.quantity || 0;
  });

  // Calculate combo total based on offer rules per group
  let comboTotalPrice = 0;
  Object.values(comboGroups).forEach((group) => {
    if (group.total === group.required && group.offerPrice) {
      // Full combo achieved, use offer price
      comboTotalPrice += group.offerPrice;
    } else {
      // Not enough for combo, fallback to individual prices
      comboTotalPrice += group.items.reduce(
        (sum, it) => sum + ((it.price || 0) * (it.quantity || 0)),
        0
      );
    }
  });

  // Regular items subtotal
  const regularTotal = regularItems.reduce(
    (sum, item: any) => sum + ((item.price || 0) * (item.quantity || 0)),
    0
  );

  // Final subtotal
  subtotal = comboTotalPrice + regularTotal;

  // ✅ Helper function to safely display color
  const getColorDisplay = (color: any): string => {
    if (!color) return 'N/A';
    if (typeof color === 'object' && color.name) return color.name;
    if (typeof color === 'string') return color; // e.g., "Red"
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
        className={`fixed top-0 right-0 h-full w-[100%] max-w-[420px] z-100 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${albertSans.className} ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Close button */}
        <button
          className="absolute right-6 top-6 text-4xl cursor-pointer text-gray-600 hover:text-black"
          onClick={() => setIsCartOpen(false)}
        >
          ×
        </button>

        {/* Header */}
        <div className="pb-4 pt-24 px-6 font-semibold text-2xl">
          Your Cart <span className="text-sm font-normal">({cartItems.length})</span>
        </div>

        {/* Main Section */}
        <div className="flex flex-col justify-between h-[calc(100%-9rem)] overflow-y-scroll px-6 scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="flex flex-col flex-1 justify-center items-center text-gray-500 text-sm">
              <p className="text-black text-xl">Your Cart is Empty</p>
              <p>Add some items to your cart.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* ✅ COMBO SECTION - Dotted Box */}
              {comboItems.length > 0 && (
                <div className="border-2 border-dashed border-gray-400  p-4 mb-2">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-base">Combo</h3>
                    <div className="flex flex-wrap gap-2">
                      {comboStatus.map((cs) => (
                        <span key={cs.comboKey}>
                          {cs.isUnder && (
                            <span className="bg-red-100 text-red-600 text-xs px-3 py-1  font-medium">
                              {cs.slotsLeft} more to be added!
                            </span>
                          )}
                          {cs.isFull && (
                            <span className="bg-green-100 text-green-600 text-xs px-3 py-1  font-medium">
                              Combo is full!
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {comboItems.map((item: CartItem, index: number) => {
                      const actualIndex = cartItems.findIndex((i) => i.uniqueKey === item.uniqueKey);
                      const productKey = (item as any).productId as string | undefined;
                      return (
                        <div
                          key={item.uniqueKey || `combo-${index}`}
                          className="flex flex-row items-stretch gap-3 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0"
                        >
                          <Image
                            src={item.image || "/placeholder.jpg"}
                            alt={item.title || "Product image"}
                            width={64}
                            height={80}
                            className="w-16 h-20 object-cover"
                          />

                          <div className="flex flex-row w-full items-center justify-between">
                            <div className="flex flex-col h-full justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                                <p className="text-xs text-gray-500">
                                  {item.size || 'N/A'} | {getColorDisplay(item.color)}
                                </p>
                              </div>
                              <p className="text-base font-semibold text-gray-900">₹{item.price ?? 0}</p>
                            </div>

                            <div className="flex flex-col items-end h-full justify-between">
                              <button
                                onClick={() => removeFromCart(actualIndex)}
                                className="text-gray-400 cursor-pointer"
                              >
                                <Image src="/Trash.svg" alt="Remove" width={16} height={16} />
                              </button>

                              <div className="flex bg-gray-100 px-2 py-0.5  text-sm">
                                <button
                                  onClick={() => decrementQuantity(actualIndex)}
                                  className="text-gray-800 cursor-pointer font-medium px-1"
                                >
                                  –
                                </button>
                                <span className="px-2">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    if ((item as any).isCombo) {
                                      if (productKey) {
                                        const cg = comboLimitMap[productKey];
                                        if (cg && cg.required > 0 && cg.total >= cg.required) return; // Block increment
                                      }
                                      incrementQuantity(actualIndex);
                                    } else {
                                      incrementQuantity(actualIndex);
                                    }
                                  }}
                                  className={`text-gray-800 cursor-pointer font-medium px-1 ${(() => {
                                    if (!(item as any).isCombo) return '';
                                    if (!productKey) return '';
                                    const cg = comboLimitMap[productKey];
                                    return cg && cg.required > 0 && cg.total >= cg.required ? 'opacity-50 cursor-not-allowed' : '';
                                  })()}`}
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
                </div>
              )}

              {/* ✅ REGULAR ITEMS SECTION */}
              {regularItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  {regularItems.map((item: CartItem, index: number) => {
                    const actualIndex = cartItems.findIndex((i) => i.uniqueKey === item.uniqueKey);
                    return (
                      <div
                        key={item.uniqueKey || `regular-${index}`}
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
                              onClick={() => removeFromCart(actualIndex)}
                              className="text-gray-400 cursor-pointer"
                            >
                              <Image src="/Trash.svg" alt="Remove" width={18} height={18} />
                            </button>

                            <div className="flex bg-gray-100 px-3 py-1">
                              <button
                                onClick={() => decrementQuantity(actualIndex)}
                                className="text-gray-800 cursor-pointer text-lg font-medium px-1"
                              >
                                –
                              </button>
                              <span className="px-3">{item.quantity}</span>
                              <button
                                onClick={() => incrementQuantity(actualIndex)}
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
            </div>
          )}

          {/* Bottom section */}
          <div className="sticky bottom-0 bg-white py-4 mt-4">
            <div className="flex justify-between text-base pt-2 pb-6">
              <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
              <span className='text-xl font-semibold'>₹{subtotal.toFixed(2)}</span>
            </div>

            {cartItems.length > 0 ? (
              <>
                <button
                  className="w-full py-2 cursor-pointer bg-black text-white font-semibold text-base hover:bg-gray-800 mb-2"
                  onClick={() => { setIsCartOpen(false); router.push('/cart'); }}
                >
                  Go to Cart
                </button>
                <button
                  className="w-full py-2 cursor-pointer bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 mb-2"
                  onClick={() => {
                    // Block checkout if any combo group underfilled
                    const underfilled = comboStatus.filter(cs => cs.isUnder);
                    if (underfilled.length > 0) {
                      // Build message summarizing missing slots
                      const msg = underfilled.map(u => `${u.slotsLeft} more products to be added for combo`).join(' | ');
                      toast.error(msg || 'Please complete combo requirements before checkout', {
                        style: { borderRadius: 0 }
                      });
                      return; // Do not navigate
                    }
                    router.push('/checkout');
                    setIsCartOpen(false);
                  }}
                >
                  Continue to Checkout
                </button>
              </>
            ) : null}

            <button
              className="w-full py-2 border cursor-pointer border-black font-semibold text-base hover:bg-gray-100"
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