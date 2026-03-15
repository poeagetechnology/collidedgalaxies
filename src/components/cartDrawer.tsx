"use client";
import { useCart, CartItem } from "@/src/context/CartContext";
import { toast } from "react-hot-toast";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
  } = useCart();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"cart" | "orders">("cart");

  const subtotal = cartItems.reduce(
    (sum, item: any) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  );

  const getColorDisplay = (color: any): string => {
    if (!color) return "N/A";
    if (typeof color === "object" && color.name) return color.name;
    if (typeof color === "string") return color;
    return "N/A";
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
        className={`fixed top-0 right-0 h-full w-full sm:max-w-sm md:max-w-105 z-100 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          className="absolute right-3 sm:right-6 top-4 sm:top-6 text-2xl sm:text-4xl cursor-pointer text-gray-600 hover:text-black"
          onClick={() => setIsCartOpen(false)}
        >
          ×
        </button>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 pt-16 sm:pt-24 px-3 sm:px-6">
          <button
            onClick={() => setActiveTab("cart")}
            className={`flex-1 py-3 font-semibold text-center transition ${
              activeTab === "cart"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cart
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-3 font-semibold text-center transition ${
              activeTab === "orders"
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Track Orders
          </button>
        </div>

        {/* Main Section */}
        <div className="flex flex-col flex-1 overflow-y-auto px-3 sm:px-6 scrollbar-hide">
          {activeTab === "cart" ? (
            <>
              {/* Cart Tab */}
              <div className="pb-4 pt-4 font-semibold text-lg sm:text-2xl">
                Your Cart{" "}
                <span className="text-sm font-normal">
                  ({cartItems.length})
                </span>
              </div>
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
                              <h3 className="font-medium text-gray-900 text-base">
                                {(item as any).isBundleItem ? (
                                  <>
                                    <span
                                      className={`inline-block text-xs px-2 py-1 rounded mr-2 font-semibold ${
                                        (item as any).isFlexibleBundle
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {(item as any).isFlexibleBundle
                                        ? "FLEX BUNDLE"
                                        : "BUNDLE"}
                                    </span>
                                    {item.title}
                                  </>
                                ) : (
                                  item.title
                                )}
                              </h3>
                              {(item as any).isBundleItem ? (
                                <p className="text-xs text-gray-600 mt-1">
                                  {(item as any).isFlexibleBundle ? (
                                    <span className="text-green-600 font-semibold">
                                      ✓{" "}
                                      {(item as any).flexibleBundleItems
                                        ?.length || 0}{" "}
                                      items selected
                                    </span>
                                  ) : Object.keys(
                                      (item as any).bundleProductSizes || {},
                                    ).length > 0 ? (
                                    <span className="text-green-600 font-semibold">
                                      ✓ Sizes selected
                                    </span>
                                  ) : null}
                                  {(item as any).originalIndividualPrice && (
                                    <>
                                      {(((item as any).isFlexibleBundle
                                        ? (item as any).flexibleBundleItems
                                            ?.length
                                        : Object.keys(
                                            (item as any).bundleProductSizes ||
                                              {},
                                          ).length) || 0) > 0 && " • "}
                                      Save ₹
                                      {(
                                        (item as any).originalIndividualPrice -
                                        (item.price ?? 0)
                                      ).toFixed(2)}
                                    </>
                                  )}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  {item.size || "N/A"} |{" "}
                                  {getColorDisplay(item.color)}
                                </p>
                              )}
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{item.price ?? 0}
                            </p>
                          </div>

                          <div className="flex flex-col items-end h-full justify-between">
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-gray-400 cursor-pointer"
                            >
                              <Image
                                src="/Trash.svg"
                                alt="Remove"
                                width={18}
                                height={18}
                              />
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
            </>
          ) : (
            <>
              {/* Track Orders Tab */}
              <div className="pb-4 pt-4 font-semibold text-lg sm:text-2xl">
                Your Orders
              </div>
              <div className="flex flex-col flex-1 justify-center items-center text-gray-500">
                <Package size={48} className="mb-4 text-gray-300" />
                <p className="text-black text-base font-semibold mb-2">
                  No orders yet
                </p>
                <p className="text-sm text-center mb-6">
                  Once you place an order, you can track it here.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/my-orders");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  View All Orders
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Section - Only show for cart tab */}
        {activeTab === "cart" && (
          <div className="bg-white py-3 sm:py-4 border-t border-gray-200">
            <div className="px-3 sm:px-6 flex justify-between text-sm sm:text-base pt-2 pb-4 sm:pb-6">
              <span>
                Subtotal ({cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"})
              </span>
              <span className="text-base sm:text-xl font-semibold">
                ₹{subtotal.toFixed(2)}
              </span>
            </div>

            <div className="px-3 sm:px-6">
              {cartItems.length > 0 ? (
                <>
                  <button
                    className="w-full py-2 cursor-pointer bg-black text-white font-semibold text-sm sm:text-base hover:bg-gray-800 mb-2"
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push("/cart");
                    }}
                  >
                    Go to Cart
                  </button>
                  <button
                    className="w-full py-2 cursor-pointer bg-blue-600 text-white font-semibold text-sm sm:text-base hover:bg-blue-700 mb-2"
                    onClick={() => {
                      router.push("/checkout");
                      setIsCartOpen(false);
                    }}
                  >
                    Continue to Checkout
                  </button>
                </>
              ) : null}

              <button
                className="w-full py-2 border cursor-pointer border-black font-semibold text-sm sm:text-base hover:bg-gray-100"
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/products");
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
