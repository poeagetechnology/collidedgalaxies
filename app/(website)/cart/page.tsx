"use client";

import { useCart, CartItem } from "@/src/context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Navbar from "@/src/components/header";
import Footer from "@/src/components/footer";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, incrementQuantity, decrementQuantity } =
    useCart();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );

  const subtotal = useMemo(() => {
    let sum = 0;
    cartItems.forEach((it) => {
      sum += (it.price || 0) * (it.quantity || 1);
    });
    return sum;
  }, [cartItems]);

  const shipping = shippingMethod === "express" ? 200 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <motion.div
          className="min-h-screen bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-12">
            <motion.button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-black mb-4 sm:mb-8 transition text-sm sm:text-base"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span>Back</span>
            </motion.button>
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              SHOPPING BAG
            </motion.h1>
            <motion.div
              className="text-center py-12 sm:py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
                Your cart is empty
              </p>
              <motion.button
                onClick={() => router.push("/products")}
                className="inline-block bg-black text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 hover:bg-gray-800 text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                CONTINUE SHOPPING
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div
        className="min-h-screen bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Back Button */}
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-black mb-4 sm:mb-8 transition text-sm sm:text-base"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span>Back</span>
          </motion.button>

          {/* Header */}
          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            SHOPPING BAG
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Left Section - Products */}
            <div className="lg:col-span-2">
              <motion.div
                className="space-y-4 sm:space-y-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {cartItems.map((item: CartItem, index: number) => (
                  <motion.div
                    key={item.id || item.uniqueKey}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="shrink-0 w-full sm:w-24 md:w-32 h-40 sm:h-32 relative bg-gray-100"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          No image
                        </div>
                      )}
                    </motion.div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            Product ID: {item.productId}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-gray-400 hover:text-red-500 transition shrink-0 ml-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex gap-6 text-sm mb-4">
                        {(item as any).isBundleItem ? (
                          <>
                            {(item as any).isFlexibleBundle ? (
                              <div className="text-purple-600 font-semibold">
                                ✓{" "}
                                {(item as any).flexibleBundleItems?.length || 0}{" "}
                                items selected
                              </div>
                            ) : Object.keys(
                                (item as any).bundleProductSizes || {},
                              ).length > 0 ? (
                              <div className="text-green-600 font-semibold">
                                ✓{" "}
                                {
                                  Object.keys(
                                    (item as any).bundleProductSizes || {},
                                  ).length
                                }{" "}
                                sizes selected
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <>
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
                                  {typeof item.color === "string"
                                    ? item.color
                                    : (item.color as any)?.name ||
                                      (item.color as any)?.hex ||
                                      "Selected"}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="text-xl font-semibold">
                          ₹
                          {((item.price || 0) * (item.quantity || 1)).toFixed(
                            2,
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => decrementQuantity(index)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => incrementQuantity(index)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
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
                        checked={shippingMethod === "standard"}
                        onChange={(e) =>
                          setShippingMethod(
                            e.target.value as "standard" | "express",
                          )
                        }
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
                        checked={shippingMethod === "express"}
                        onChange={(e) =>
                          setShippingMethod(
                            e.target.value as "standard" | "express",
                          )
                        }
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
                    <span className="text-gray-600">
                      Subtotal ({cartItems.length}{" "}
                      {cartItems.length === 1 ? "item" : "items"})
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white font-semibold py-3 hover:bg-gray-800 transition mb-3"
                >
                  CONTINUE
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => router.push("/products")}
                  className="w-full border-2 border-black text-black font-semibold py-3 hover:bg-gray-100 transition"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}
