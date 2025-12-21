'use client';

import React from 'react';
import type { Product } from '@/src/server/models/product.model';
import { getCurrentPrice } from '@/src/server/services/product.service';
import Image from 'next/image';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={`overflow-x-auto ${albertSans.className}`}>
      <table className="w-full bg-white border border-collapse border-gray-200 shadow-md min-w-max">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Images
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Title
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Slug
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Category
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Current <br /> Price
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Discount <br /> <span className="text-xs sm:text-sm font-normal">(First <br /> 10 Days)</span>
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Discount <br /> <span className="text-xs sm:text-sm font-normal">(After <br /> 10 Days)</span>
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Original <br /> Price
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Sizes
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Colors
            </th>
            <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="py-2 px-2 sm:px-4 border border-gray-300">
                <div className="grid grid-cols-2 gap-2">
                  {(product.images || []).map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={product.title || "Product image"}
                      width={48}   // w-12 = 48px
                      height={48}  // h-12 = 48px
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover"
                    />
                  ))}
                </div>
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{product.title}</span>
                  <span className={`text-xs ${product.sizeChart ? 'text-green-600' : 'text-red-600'}`}>
                    {product.sizeChart ? `(${product.sizeChartName || 'Size chart available'})` : '(Size chart not available)'}
                  </span>
                </div>
              </td>
              <td className="py-2 px-2 sm:px-4 w-[20px] border border-gray-300 text-xs sm:text-sm">
                <span className="text-blue-600">{product.slug || '-'}</span>
              </td>
              <td className="py-2 px-2 sm:px-4 border w-[20px] border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                {product.category}
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap font-bold text-green-600">
                ₹{getCurrentPrice(product)}
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                ₹{product.discountPriceFirst10Days}
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                ₹{product.discountPriceAfter10Days}
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                {product.originalPrice ? `₹${product.originalPrice}` : "-"}
              </td>
              <td className="py-2 px-2 sm:px-4 w-[30px] border border-gray-300 text-xs sm:text-sm">
                <div className="max-w-32">{(product.sizes || []).join(", ")}</div>
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300">
                <div className="grid grid-cols-2 gap-1">
                  {(product.colors || []).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 border border-gray-300"
                      style={{ backgroundColor: typeof color === "string" ? color : color.hex }}
                      title={typeof color === "string" ? color : `${color.name} (${color.hex})`}
                    />
                  ))}
                </div>
              </td>
              <td className="py-2 px-2 sm:px-4 border border-gray-300">
                <div className="flex gap-1 sm:gap-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(product)}
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-2 sm:px-3 py-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-2 sm:px-3 py-1 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};