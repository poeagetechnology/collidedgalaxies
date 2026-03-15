"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Zap } from "lucide-react";
import type { Bundle } from "@/src/server/models/bundle.model";
import type { Product } from "@/src/server/models/product.model";
import BundleSizeModal from "./bundleSizeModal";

interface BundleCardProps {
  bundle: Bundle;
  onAddToCart: (bundle: Bundle, selectedSizes?: Record<string, string>) => void;
}

export default function BundleCard({ bundle, onAddToCart }: BundleCardProps) {
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!bundle.products || bundle.products.length === 0) {
          setIsLoading(false);
          return;
        }

        const productIds = bundle.products.map((p) => p.productId);
        const response = await fetch(
          `/api/products?ids=${productIds.join(",")}`,
        );
        if (response.ok) {
          const data = await response.json();
          const productMap = new Map();
          data.forEach((product: Product) => {
            productMap.set(product.id, product);
          });
          setProducts(productMap);
        }
      } catch (error) {
        console.error("Error fetching bundle products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [bundle]);

  const discountPercentage =
    bundle.originalTotalPrice > 0
      ? Math.round(
          ((bundle.originalTotalPrice - bundle.bundlePrice) /
            bundle.originalTotalPrice) *
            100,
        )
      : 0;

  const savingsAmount = bundle.originalTotalPrice - bundle.bundlePrice;

  const handleAddToCart = (selectedSizes: Record<string, string>) => {
    const firstProduct =
      bundle.products && bundle.products.length > 0
        ? products.get(bundle.products[0].productId)
        : null;

    const cartItem = {
      ...bundle,
      id: bundle.id,
      productId: bundle.id,
      title: bundle.name,
      price: bundle.bundlePrice,
      image: firstProduct?.image || bundle.image,
      isBundleItem: true,
      bundleId: bundle.id,
      bundleName: bundle.name,
      bundleProductSizes: selectedSizes, // ✅ Store selected sizes
    };
    onAddToCart(cartItem, selectedSizes);
    setIsSizeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Bundle Card - Info & Pricing */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-all duration-500 shadow-sm">
        <div className="flex flex-col lg:flex-row">
          {/* Header Section (Left on Desktop) */}
          <div className="lg:w-1/2 relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-8 md:p-12 text-white flex flex-col justify-center">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white/20 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                  EXCLUSIVE BUNDLE
                </span>
                {discountPercentage > 0 && (
                  <div className="bg-amber-400 text-black px-3 py-1 rounded-full text-xs md:text-sm font-black shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                    <Zap size={14} fill="currentColor" />
                    Save {discountPercentage}%
                  </div>
                )}
              </div>

              <h3 className="font-extrabold text-3xl md:text-5xl lg:text-6xl mb-6 leading-[1.1] tracking-tight">
                {bundle.name}
              </h3>

              {bundle.description && (
                <p className="text-base md:text-xl text-blue-50/90 leading-relaxed max-w-xl">
                  {bundle.description}
                </p>
              )}

              {/* Decorative background element */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Pricing & CTA (Right on Desktop) */}
          <div className="lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gray-50/50 border-l border-gray-100">
            <div className="max-w-xl mx-auto lg:mx-0 w-full lg:pl-8 space-y-10">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Special Offer Price
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">
                      ₹{bundle.bundlePrice.toFixed(0)}
                    </p>
                    {bundle.originalTotalPrice > bundle.bundlePrice && (
                      <span className="text-2xl md:text-3xl text-gray-400 line-through font-medium">
                        ₹{bundle.originalTotalPrice.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {bundle.originalTotalPrice > bundle.bundlePrice && (
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
                  onClick={() => setIsSizeModalOpen(true)}
                  className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-5 px-8 rounded-2xl hover:from-black hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-3 font-black text-lg md:text-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.25)] hover:-translate-y-1 active:translate-y-0"
                >
                  <ShoppingCart size={24} strokeWidth={2.5} />
                  Claim This Bundle
                </button>
                <p className="text-center text-xs md:text-sm text-gray-400 font-medium">
                  Limited inventory available. Usually ships in 24h.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section - Separate Below Card */}
      {bundle.products && bundle.products.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h4 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                What's included in this deal?
              </h4>
              <p className="text-gray-500 font-medium mt-1">
                You're getting all{" "}
                <span className="text-blue-600 font-bold">
                  {bundle.products.length} premium products
                </span>{" "}
                below for one low price.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-lg">
              Scroll to explore
              <span className="text-xl">→</span>
            </div>
          </div>

          {/* Products Grid with Horizontal Scroll on Desktop */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div
              className={`flex gap-4 md:gap-6 lg:gap-8 ${bundle.products.length <= 3 ? "md:justify-start lg:justify-between" : "justify-start"}`}
            >
              {bundle.products.map((bundleProduct, idx) => {
                const product = products.get(bundleProduct.productId);
                const productPrice = product?.originalPrice
                  ? parseFloat(product.originalPrice)
                  : 0;
                const productImage = product?.image || "";

                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 border border-gray-100 rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 bg-white group ${bundle.products.length <= 3 ? "w-[calc(100%-2rem)] md:w-[calc(33.333%-1.5rem)] lg:flex-1 max-w-[450px]" : "w-[280px] md:w-[380px] lg:w-[420px]"}`}
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-square bg-[#F8F9FA] overflow-hidden">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={bundleProduct.title || "Product"}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <div className="text-5xl">📦</div>
                        </div>
                      )}

                      {/* Quantity Badge */}
                      {bundleProduct.quantity > 1 && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-black px-3 py-2 rounded-xl shadow-lg">
                          QTY: {bundleProduct.quantity}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h4 className="font-bold text-base text-gray-900 line-clamp-2 mb-2 leading-tight h-10 group-hover:text-blue-600 transition-colors">
                        {product?.title || bundleProduct.title || "Product"}
                      </h4>
                      <div className="flex items-center justify-between mt-4">
                        {productPrice > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                              Value
                            </span>
                            <p className="text-lg font-bold text-gray-900 tracking-tight">
                              ₹{productPrice.toFixed(0)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                            Included
                          </span>
                        )}
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-400 transition-colors">
                          <ShoppingCart size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bundle Size Selection Modal */}
      <BundleSizeModal
        isOpen={isSizeModalOpen}
        bundle={bundle}
        products={products}
        onClose={() => setIsSizeModalOpen(false)}
        onConfirm={handleAddToCart}
      />
    </div>
  );
}
