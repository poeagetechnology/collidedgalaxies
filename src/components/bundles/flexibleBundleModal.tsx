"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Check, Plus, Minus } from "lucide-react";
import type { Product } from "@/src/server/models/product.model";
import toast from "react-hot-toast";

interface FlexibleBundleItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

interface FlexibleBundleModalProps {
  isOpen: boolean;
  bundleName: string;
  bundlePrice: number;
  requiredItems: number;
  productCategory: string; // e.g., "t-shirt", "shirt"
  onClose: () => void;
  onConfirm: (items: FlexibleBundleItem[]) => void;
}

export default function FlexibleBundleModal({
  isOpen,
  bundleName,
  bundlePrice,
  requiredItems,
  productCategory,
  onClose,
  onConfirm,
}: FlexibleBundleModalProps) {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<FlexibleBundleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/products?category=${productCategory}`,
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableProducts(data);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        setError("Error loading products");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, productCategory]);

  if (!isOpen) return null;

  const handleSelectProduct = (product: Product) => {
    // Check if product already selected
    const alreadySelected = selectedItems.some(
      (item) => item.product.id === product.id,
    );

    if (alreadySelected) {
      setSelectedItems(
        selectedItems.filter((item) => item.product.id !== product.id),
      );
      setError("");
      return;
    }

    // Check if we've already selected required number of items
    if (selectedItems.length >= requiredItems) {
      setError(`Select only ${requiredItems} items`);
      return;
    }

    // Add product with default size
    const defaultSize =
      product.sizes && product.sizes.length > 0 ? product.sizes[0] : "";
    setSelectedItems([
      ...selectedItems,
      { product, quantity: 1, selectedSize: defaultSize },
    ]);
    setError("");
  };

  const handleSizeChange = (productId: string, newSize: string) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.product.id === productId
          ? { ...item, selectedSize: newSize }
          : item,
      ),
    );
  };

  const handleConfirm = () => {
    // Validate all items have sizes selected
    const missingSize = selectedItems.find((item) => !item.selectedSize);
    if (missingSize) {
      setError("Please select a size for all items");
      return;
    }

    // Validate we have exact number of items
    if (selectedItems.length !== requiredItems) {
      setError(`Please select exactly ${requiredItems} items`);
      return;
    }

    onConfirm(selectedItems);
    setSelectedItems([]);
    setError("");
  };

  const remainingItems = requiredItems - selectedItems.length;
  const isComplete = selectedItems.length === requiredItems;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-998 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-999 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-linear-to-r from-gray-900 to-gray-800 p-6 md:p-8 flex items-center justify-between rounded-t-3xl">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {bundleName}
              </h2>
              <p className="text-gray-300 mt-1 text-sm md:text-base">
                Pick any {requiredItems} items at ₹{bundlePrice}
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
            {/* Selection Progress */}
            <div className="bg-linear-to-rrom-gray-50 to-gray-100 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800">
                  Selected: {selectedItems.length} of {requiredItems}
                </span>
                <span className="text-2xl font-black text-gray-900">
                  ₹{bundlePrice}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-gray-900 to-gray-800 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(selectedItems.length / requiredItems) * 100}%`,
                  }}
                />
              </div>
              {remainingItems > 0 && (
                <p className="text-sm text-gray-600 mt-3">
                  {remainingItems} more{" "}
                  {remainingItems === 1 ? "item" : "items"} to go!
                </p>
              )}
            </div>

            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Your Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-green-500 rounded-xl p-4 bg-green-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-2">
                            {item.product.title}
                          </h4>
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            ✓ Selected
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectProduct(item.product)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs font-semibold text-gray-700 block mb-2">
                          Size
                        </label>
                        <select
                          value={item.selectedSize}
                          onChange={(e) =>
                            handleSizeChange(item.product.id, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Size</option>
                          {item.product.sizes?.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Products */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : availableProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products available</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-4">
                  Available Items ({availableProducts.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pb-4">
                  {availableProducts.map((product) => {
                    const isSelected = selectedItems.some(
                      (item) => item.product.id === product.id,
                    );

                    return (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        disabled={
                          !isSelected && selectedItems.length >= requiredItems
                        }
                        className={`rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                          isSelected
                            ? "border-green-500 ring-2 ring-green-300"
                            : "border-gray-200 hover:border-gray-600"
                        } ${
                          !isSelected && selectedItems.length >= requiredItems
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.title || ""}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              No image
                            </div>
                          )}

                          {/* Selection Badge */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            {isSelected && (
                              <div className="bg-green-500 text-white rounded-full p-2">
                                <Check size={20} />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-2 text-left">
                          <p className="text-xs font-bold text-gray-900 line-clamp-2">
                            {product.title}
                          </p>
                          {product.originalPrice && (
                            <p className="text-xs text-gray-600 mt-1">
                              ₹{parseFloat(product.originalPrice).toFixed(0)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
              disabled={!isComplete}
              className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition text-sm md:text-base ${
                isComplete
                  ? "bg-linear-to-r from-gray-900 to-gray-800 hover:shadow-lg hover:from-gray-800 hover:to-gray-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isComplete ? "Add to Cart" : `Select ${requiredItems} Items`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
