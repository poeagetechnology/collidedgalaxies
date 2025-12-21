'use client';

import React from 'react';
import type { Color } from '@/src/server/models/product.model';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface Props {
  colors: Color[];
  colorNameInput: string;
  colorInput: string;

  setColorNameInput: (v: string) => void;
  setColorInput: (v: string) => void;

  handleAddColor: () => void;
  handleRemoveColor: (index: number) => void;
}

const ProductColors: React.FC<Props> = ({
  colors,
  colorNameInput,
  colorInput,
  setColorNameInput,
  setColorInput,
  handleAddColor,
  handleRemoveColor,
}) => {
  return (
    <div className={`border p-3 sm:p-4 flex flex-col gap-2 ${albertSans.className}`}>
      <h2 className="font-semibold text-sm sm:text-base">Colors (HEX codes)</h2>

      {/* Color Inputs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Color Name (e.g., White)"
          value={colorNameInput}
          onChange={(e) => setColorNameInput(e.target.value)}
          className="border p-1.5 text-sm flex-1"
        />

        <input
          type="text"
          placeholder="#FFFFFF"
          value={colorInput}
          onChange={(e) => setColorInput(e.target.value)}
          className="border p-1.5 text-sm flex-1"
        />

        <button
          type="button"
          onClick={handleAddColor}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 cursor-pointer text-sm whitespace-nowrap"
        >
          Add Color
        </button>
      </div>

      {/* Color List */}
      <div className="flex flex-wrap gap-2">
        {colors.map((c, idx) => (
          <div
            key={idx}
            className="bg-gray-200 px-2 py-1 flex items-center gap-2 text-xs sm:text-sm"
          >
            <div
              className="w-5 h-5 border"
              style={{ backgroundColor: c.hex }}
            ></div>

            <span className="font-medium">{c.name}</span>
            <span className="text-gray-600">{c.hex}</span>

            <button
              onClick={() => handleRemoveColor(idx)}
              className="text-red-500 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductColors;
