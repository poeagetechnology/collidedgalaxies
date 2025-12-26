'use client';

import React from 'react';

interface Props {
  hasCombos: boolean;
  setHasCombos: (val: boolean) => void;
  comboQuantity: string;
  comboOriginalPrice: string;
  comboDiscountPrice: string;
  setComboQuantity: (v: string) => void;
  setComboOriginalPrice: (v: string) => void;
  setComboDiscountPrice: (v: string) => void;
}

const ProductCombos: React.FC<Props> = ({
  hasCombos,
  setHasCombos,
  comboQuantity,
  comboOriginalPrice,
  comboDiscountPrice,
  setComboQuantity,
  setComboOriginalPrice,
  setComboDiscountPrice,
}) => {
  return (
    <>
      {/* Combo Toggle */}
      <div className="mb-2 flex items-center">
        <label className="mr-3 font-semibold text-sm">
          Does this product have combos?
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasCombos}
            onChange={() => setHasCombos(!hasCombos)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-600 relative transition">
            <div
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${
                hasCombos ? 'translate-x-5' : ''
              }`}
            />
          </div>
          <span className="ml-2 text-sm">{hasCombos ? 'Yes' : 'No'}</span>
        </label>
      </div>

      {/* Combo Fields */}
      {hasCombos && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Combo Quantity</label>
            <input
              type="number"
              min="1"
              className="border p-2 text-sm w-full"
              value={comboQuantity}
              onChange={(e) => setComboQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Original Price</label>
            <input
              type="number"
              min="0"
              className="border p-2 text-sm w-full"
              value={comboOriginalPrice}
              onChange={(e) => setComboOriginalPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Discounted Price</label>
            <input
              type="number"
              min="0"
              className="border p-2 text-sm w-full"
              value={comboDiscountPrice}
              onChange={(e) => setComboDiscountPrice(e.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCombos;
