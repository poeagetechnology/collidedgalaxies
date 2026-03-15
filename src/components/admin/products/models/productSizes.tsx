'use client';

import React from 'react';

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
    <div className="border p-3 sm:p-4 flex flex-col gap-2">
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
