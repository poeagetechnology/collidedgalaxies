'use client';

import React from 'react';
import type { ProductFormData } from '@/src/server/models/product.model';

interface Props {
  form: ProductFormData;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  categories: Array<{ id: string; name: string }>;
}

const ProductBasicInfo: React.FC<Props> = ({
  form,
  handleTitleChange,
  handleChange,
  categories,
}) => {
  return (
    <>
      {/* Product Title */}
      <input
        name="title"
        className="border p-2 text-sm sm:text-base"
        placeholder="Product Title"
        value={form.title}
        onChange={handleTitleChange}
      />

      {/* Slug */}
      {form.slug && (
        <div className="border p-2 text-sm bg-gray-50 text-gray-600">
          <span className="font-medium">Slug: </span>
          <span className="text-blue-600">{form.slug}</span>
        </div>
      )}

      {/* Discount Price First 10 Days */}
      <input
        name="discountPriceFirst10Days"
        className="border p-2 text-sm sm:text-base"
        placeholder="Discount Price for first 10 days (₹)"
        value={form.discountPriceFirst10Days}
        onChange={handleChange}
      />

      {/* Discount Price After 10 Days */}
      <input
        name="discountPriceAfter10Days"
        className="border p-2 text-sm sm:text-base"
        placeholder="Discount Price after 10 days (₹)"
        value={form.discountPriceAfter10Days}
        onChange={handleChange}
      />

      {/* Original Price */}
      <input
        name="originalPrice"
        className="border p-2 text-sm sm:text-base"
        placeholder="Original Price (optional)"
        value={form.originalPrice}
        onChange={handleChange}
      />

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm sm:text-base">Category *</label>
        <select
          name="category"
          className="border p-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-1 focus:ring-black"
          value={form.category}
          onChange={handleChange}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <textarea
        name="description"
        className="border p-2 text-sm sm:text-base"
        placeholder="Product Description"
        value={form.description}
        onChange={handleChange}
        rows={3}
      />
    </>
  );
};

export default ProductBasicInfo;
