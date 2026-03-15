"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Bundle, BundleProduct } from "@/src/server/models/bundle.model";
import type { Product } from "@/src/server/models/product.model";

interface BundleSizeModalProps {
  isOpen: boolean;
  bundle: Bundle;
  products: Map<string, Product>;
  onClose: () => void;
  onConfirm: (selectedSizes: Record<string, string>) => void;
}

export default function BundleSizeModal({
  isOpen,
  bundle,
  products,
  onClose,
  onConfirm,
}: BundleSizeModalProps) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
    setError("");
  };

  const handleConfirm = () => {
    // Check if all products have sizes selected
    const missingSize = bundle.products?.find(
      (p) => !selectedSizes[p.productId],
    );

    if (missingSize) {
      setError("Please select a size for all items in the bundle");
      return;
    }

    onConfirm(selectedSizes);
    setSelectedSizes({});
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-998 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-gray-900 to-gray-800 p-6 md:p-8 flex items-center justify-between rounded-t-3xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {bundle.name}
              </h2>
              <p className="text-gray-300 mt-1 text-sm md:text-base">
                Select your size for each item
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
            {bundle.products?.map((bundleProduct: BundleProduct, idx) => {
              const product = products.get(bundleProduct.productId);
              const sizes = product?.sizes || [];
              const isSelected = !!selectedSizes[bundleProduct.productId];

              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition"
                >
                  {/* Product Header */}
                  <div className="flex gap-4 mb-6">
                    {product?.image && (
                      <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={product.image}
                          alt={product.title || ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1">
                        {product?.title || bundleProduct.title}
                      </h3>
                      {bundleProduct.quantity > 1 && (
                        <p className="text-sm text-gray-900 font-semibold">
                          Quantity: {bundleProduct.quantity}
                        </p>
                      )}
                      {product?.originalPrice && (
                        <p className="text-gray-600 text-sm mt-2">
                          ₹{parseFloat(product.originalPrice).toFixed(0)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Choose Size {isSelected && "✓"}
                    </label>

                    {sizes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() =>
                              handleSizeSelect(bundleProduct.productId, size)
                            }
                            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-semibold transition-all border-2 text-sm md:text-base ${
                              selectedSizes[bundleProduct.productId] === size
                                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-600"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        No sizes available for this product
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 md:p-8 rounded-b-3xl border-t border-gray-100 flex gap-3 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-gray-900 to-gray-800 text-white font-bold hover:shadow-lg transition text-sm md:text-base hover:from-gray-800 hover:to-gray-700"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
