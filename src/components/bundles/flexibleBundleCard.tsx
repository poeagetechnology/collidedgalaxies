"use client";

import React, { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import FlexibleBundleModal from "./flexibleBundleModal";
import type { Product } from "@/src/server/models/product.model";
import { useCart } from "@/src/context/CartContext";
import toast from "react-hot-toast";

interface FlexibleBundleItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

interface FlexibleBundleCardProps {
  bundleId: string;
  bundleName: string;
  bundleDescription?: string;
  bundlePrice: number;
  originalPrice: number;
  requiredItems: number;
  productCategory: string;
  backgroundGradient?: string;
  accentColor?: string;
}

export default function FlexibleBundleCard({
  bundleId,
  bundleName,
  bundleDescription,
  bundlePrice,
  originalPrice,
  requiredItems,
  productCategory,
  backgroundGradient = "from-purple-600 via-pink-600 to-red-600",
  accentColor = "purple",
}: FlexibleBundleCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  const discountPercentage = Math.round(
    ((originalPrice - bundlePrice) / originalPrice) * 100,
  );
  const savingsAmount = originalPrice - bundlePrice;

  const handleBundleComplete = (selectedItems: FlexibleBundleItem[]) => {
    // Create a bundle item for cart
    const cartItem = {
      id: bundleId,
      productId: bundleId,
      title: bundleName,
      price: bundlePrice,
      quantity: 1,
      image: selectedItems[0]?.product?.image || "",
      isBundleItem: true,
      isFlexibleBundle: true, // ✅ Mark as flexible bundle
      bundleId: bundleId,
      bundleName: bundleName,
      bundlePrice: bundlePrice,
      originalIndividualPrice: originalPrice,
      flexibleBundleItems: selectedItems.map((item) => ({
        productId: item.product.id,
        title: item.product.title || "Product",
        image: item.product.image || "",
        size: item.selectedSize,
        price: item.product.originalPrice
          ? parseFloat(item.product.originalPrice)
          : 0,
        quantity: item.quantity,
      })), // ✅ Store selected items with sizes
    };

    addToCart(cartItem);
    toast.success(
      `✨ "${bundleName}" added to cart! Saving ₹${savingsAmount.toFixed(0)}`,
      { style: { borderRadius: 0 } },
    );
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-all duration-500 shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* Header Section (Left on Desktop) */}
          <div
            className={`lg:w-1/2 relative bg-gradient-to-br ${backgroundGradient} p-8 md:p-12 text-white flex flex-col justify-center`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white/20 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                  FLEXIBLE BUNDLE
                </span>
                {discountPercentage > 0 && (
                  <div className="bg-yellow-300 text-black px-3 py-1 rounded-full text-xs md:text-sm font-black shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap size={14} fill="currentColor" />
                    Save {discountPercentage}%
                  </div>
                )}
              </div>

              <h3 className="font-extrabold text-3xl md:text-5xl lg:text-6xl mb-4 leading-[1.1] tracking-tight">
                {bundleName}
              </h3>

              <div className="text-2xl md:text-3xl font-bold text-white/90 mb-2">
                Pick any {requiredItems}
              </div>

              {bundleDescription && (
                <p className="text-base md:text-xl text-white/80 leading-relaxed max-w-xl">
                  {bundleDescription}
                </p>
              )}

              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Pricing & CTA (Right on Desktop) */}
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gray-50/50 border-l border-gray-100">
            <div className="max-w-xl mx-auto lg:mx-0 w-full lg:pl-8 space-y-10">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Any {requiredItems} at
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">
                      ₹{bundlePrice}
                    </p>
                    {originalPrice > bundlePrice && (
                      <span className="text-2xl md:text-3xl text-gray-400 line-through font-medium">
                        ₹{originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {originalPrice > bundlePrice && (
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-lg border border-green-200">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs">
                      ✓
                    </span>
                    You save ₹{savingsAmount.toFixed(0)} today!
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`w-full bg-gradient-to-r from-${accentColor}-900 to-${accentColor}-900 text-white py-5 px-8 rounded-2xl hover:from-${accentColor}-800 hover:to-${accentColor}-700 transition-all duration-300 flex items-center justify-center gap-3 font-black text-lg md:text-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:translate-y-0`}
                >
                  <ShoppingCart size={24} strokeWidth={2.5} />
                  Pick Your Items
                </button>
                <p className="text-center text-xs md:text-sm text-gray-400 font-medium">
                  Choose {requiredItems} items from {productCategory}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flexible Bundle Modal */}
      <FlexibleBundleModal
        isOpen={isModalOpen}
        bundleName={bundleName}
        bundlePrice={bundlePrice}
        requiredItems={requiredItems}
        productCategory={productCategory}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleBundleComplete}
      />
    </>
  );
}
