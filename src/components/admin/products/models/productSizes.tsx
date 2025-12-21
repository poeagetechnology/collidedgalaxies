'use client';

import React from 'react';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface Props {
  sizeOptions: string[];
  selectedSizes: string[];
  handleSizeToggle: (size: string) => void;
}

const ProductSizes: React.FC<Props> = ({
  sizeOptions,
  selectedSizes,
  handleSizeToggle,
}) => {
  return (
    <div className={`border p-3 sm:p-4 flex flex-col gap-2 ${albertSans.className}`}>
      <h2 className="font-semibold text-sm sm:text-base">Sizes</h2>

      <div className="flex flex-wrap gap-3">
        {sizeOptions.map((size) => (
          <label key={size} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSizes.includes(size)}
              onChange={() => handleSizeToggle(size)}
            />
            {size}
          </label>
        ))}
      </div>
    </div>
  );
};

export default ProductSizes;
