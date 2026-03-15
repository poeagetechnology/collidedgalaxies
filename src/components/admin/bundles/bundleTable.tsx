"use client";

import React from "react";
import type { Bundle } from "@/src/server/models/bundle.model";
import { Trash2, Edit2 } from "lucide-react";

interface BundleTableProps {
  bundles: Bundle[];
  onEdit: (bundle: Bundle) => void;
  onDelete: (id: string) => void;
}

export default function BundleTable({
  bundles,
  onEdit,
  onDelete,
}: BundleTableProps) {
  const getDiscountPercentage = (original: number, bundled: number): string => {
    if (original === 0) return "0%";
    const percentage = Math.round(((original - bundled) / original) * 100);
    return `${percentage}%`;
  };

  return (
    <div className="overflow-x-auto border border-gray-300">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Bundle Name</th>
            <th className="px-4 py-3 text-left font-semibold">Products</th>
            <th className="px-4 py-3 text-left font-semibold">
              Original Price
            </th>
            <th className="px-4 py-3 text-left font-semibold">Bundle Price</th>
            <th className="px-4 py-3 text-left font-semibold">Discount</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bundles.map((bundle) => (
            <tr
              key={bundle.id}
              className="border-b border-gray-300 hover:bg-gray-50"
            >
              <td className="px-4 py-3">{bundle.name}</td>
              <td className="px-4 py-3">{bundle.products?.length || 0}</td>
              <td className="px-4 py-3">
                ₹{bundle.originalTotalPrice?.toFixed(2) || "0"}
              </td>
              <td className="px-4 py-3">
                ₹{bundle.bundlePrice?.toFixed(2) || "0"}
              </td>
              <td className="px-4 py-3 font-semibold text-green-600">
                {getDiscountPercentage(
                  bundle.originalTotalPrice,
                  bundle.bundlePrice,
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    bundle.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {bundle.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => onEdit(bundle)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Edit bundle"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(bundle.id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete bundle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bundles.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          No bundles found. Create one to get started!
        </div>
      )}
    </div>
  );
}
