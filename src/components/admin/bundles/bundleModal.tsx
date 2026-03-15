"use client";

import React, { useState, useEffect } from "react";
import type {
  Bundle,
  BundleFormData,
  BundleProduct,
} from "@/src/server/models/bundle.model";
import type { Product } from "@/src/server/models/product.model";
import { X } from "lucide-react";

interface BundleModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (formData: BundleFormData) => Promise<void>;
  editingBundle?: Bundle | null;
  products: Product[];
}

const BundleModal: React.FC<BundleModalProps> = ({
  show,
  onClose,
  onSave,
  editingBundle,
  products,
}) => {
  const [form, setForm] = useState<BundleFormData>({
    name: "",
    description: "",
    products: [],
    originalTotalPrice: 0,
    bundlePrice: 0,
    isActive: true,
    category: "",
    tags: [],
  });

  const [selectedProducts, setSelectedProducts] = useState<{
    [key: string]: number;
  }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingBundle) {
      setForm({
        name: editingBundle.name,
        description: editingBundle.description || "",
        products: editingBundle.products,
        originalTotalPrice: editingBundle.originalTotalPrice,
        bundlePrice: editingBundle.bundlePrice,
        isActive: editingBundle.isActive,
        category: editingBundle.category || "",
        tags: editingBundle.tags || [],
        image: editingBundle.image,
        images: editingBundle.images,
      });

      const productsMap: { [key: string]: number } = {};
      editingBundle.products.forEach((p) => {
        productsMap[p.productId] = p.quantity;
      });
      setSelectedProducts(productsMap);
    } else {
      resetForm();
    }
  }, [editingBundle, show]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      products: [],
      originalTotalPrice: 0,
      bundlePrice: 0,
      isActive: true,
      category: "",
      tags: [],
    });
    setSelectedProducts({});
  };

  const toggleProduct = (productId: string, quantity: number = 1) => {
    const newSelectedProducts = { ...selectedProducts };

    if (newSelectedProducts[productId]) {
      delete newSelectedProducts[productId];
    } else {
      newSelectedProducts[productId] = quantity;
    }

    setSelectedProducts(newSelectedProducts);
    updateBundleProducts(newSelectedProducts);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const newSelectedProducts = {
      ...selectedProducts,
      [productId]: Math.max(1, quantity),
    };
    setSelectedProducts(newSelectedProducts);
    updateBundleProducts(newSelectedProducts);
  };

  const updateBundleProducts = (productsMap: { [key: string]: number }) => {
    const bundleProducts: BundleProduct[] = Object.entries(productsMap).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      }),
    );

    // Calculate original total price
    const originalTotal = bundleProducts.reduce((sum, bp) => {
      const product = products.find((p) => p.id === bp.productId);
      const price =
        Math.round(parseFloat(product?.originalPrice || "0") * 100) / 100;
      return sum + price * bp.quantity;
    }, 0);

    setForm((prev) => ({
      ...prev,
      products: bundleProducts,
      originalTotalPrice: originalTotal,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Bundle name is required");
      return;
    }

    if (form.products.length === 0) {
      alert("Please select at least one product for the bundle");
      return;
    }

    if (form.bundlePrice <= 0) {
      alert("Bundle price must be greater than 0");
      return;
    }

    if (form.bundlePrice > form.originalTotalPrice) {
      alert("Bundle price cannot be more than the original total price");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(form);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving bundle:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!show) return null;

  const selectedProductsList = form.products.map((bp) => {
    const product = products.find((p) => p.id === bp.productId);
    return { ...bp, ...product };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            {editingBundle ? "Edit Bundle" : "Create Bundle"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bundle Information</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bundle Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Summer Collection Bundle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Describe what's in this bundle"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Original Total Price
                </label>
                <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50">
                  ₹{form.originalTotalPrice.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Bundle Price *
                </label>
                <input
                  type="number"
                  value={form.bundlePrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bundlePrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium cursor-pointer"
              >
                Active
              </label>
            </div>
          </div>

          {/* Products Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Products</h3>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded p-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`product-${product.id}`}
                      checked={!!selectedProducts[product.id]}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor={`product-${product.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-600">
                        ₹{product.originalPrice}
                      </div>
                    </label>

                    {selectedProducts[product.id] && (
                      <input
                        type="number"
                        min="1"
                        value={selectedProducts[product.id]}
                        onChange={(e) =>
                          updateQuantity(product.id, parseInt(e.target.value))
                        }
                        className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 py-4">No products available</div>
              )}
            </div>
          </div>

          {/* Selected Products Summary */}
          {selectedProductsList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Selected Products</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedProductsList.map((product) => (
                  <div
                    key={product.productId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {product.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ₹
                        {(
                          parseFloat(product.originalPrice || "0") *
                          product.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discount Summary */}
          {form.originalTotalPrice > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded space-y-2">
              <div className="flex justify-between">
                <span>Original Total Price:</span>
                <span className="font-semibold">
                  ₹{form.originalTotalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bundle Price:</span>
                <span className="font-semibold">
                  ₹{form.bundlePrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Customer Saves:</span>
                <span className="font-bold text-green-600">
                  ₹{(form.originalTotalPrice - form.bundlePrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount %:</span>
                <span className="font-bold text-green-600">
                  {form.originalTotalPrice > 0
                    ? Math.round(
                        ((form.originalTotalPrice - form.bundlePrice) /
                          form.originalTotalPrice) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 font-medium disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : editingBundle
                ? "Update Bundle"
                : "Create Bundle"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundleModal;
