'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Product } from '@/src/server/models/product.model';
import { getProductUrl, getCurrentPrice, subscribeToNewArrivals } from '@/src/server/services/product.service';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewThisWeek() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = subscribeToNewArrivals(setProducts, 8);
    return () => unsub();
  }, []);

  const hasAvailableSizes = (product: Product): boolean => {
    return !!(product.sizes && product.sizes.length > 0);
  };

  const itemsPerView = 4;
  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  const nextSlide = () => {
    if (currentIndex + itemsPerView < products.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            NEW
            <br />
            THIS WEEK <span className="text-blue-600">({products.length})</span>
          </h2>
          <Link href="/products" className="text-gray-600 hover:text-gray-900 text-sm">
            See All
          </Link>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {visibleProducts.length === 0 ? (
              <p className="col-span-full text-center text-lg text-gray-600">No products found.</p>
            ) : (
              visibleProducts.map((product) => {
                const currentPrice = getCurrentPrice(product);
                const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.png';
                const productUrl = getProductUrl(product);
                const isOutOfStock = !hasAvailableSizes(product);

                return (
                  <div key={product.id} className="flex flex-col group">
                    {/* Product Image */}
                    <Link href={productUrl}>
                      <div className="relative aspect-square bg-gray-100 overflow-hidden mb-4 cursor-pointer">
                        <Image
                          src={displayImage}
                          alt={product.title ?? 'product'}
                          fill
                          className={`object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
                            isOutOfStock ? 'opacity-60 grayscale' : ''
                          }`}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />

                        {/* Out of Stock Tag */}
                        {isOutOfStock && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white font-semibold px-2 py-1 text-xs z-10">
                            OUT OF STOCK
                          </span>
                        )}

                        {/* Combo Tag */}
                        {!isOutOfStock && product.hasCombos && !!product.comboQuantity && !!product.comboDiscountPrice && (
                          <span className="absolute top-2 left-2 bg-green-100 text-green-800 font-semibold px-2 py-1 text-xs z-10">
                            BUY {product.comboQuantity} @{product.comboDiscountPrice}
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 uppercase mb-1">{product.category}</p>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>

                      {/* Price */}
                      {product.originalPrice ? (
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          ₹{currentPrice}{' '}
                          <span className="line-through text-red-500 ml-1 font-normal text-xs">₹{product.originalPrice}</span>
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 mb-3">₹{currentPrice}</p>
                      )}
                    </div>

                    {/* Plus Button */}
                    <Link href={productUrl}>
                      <button
                        disabled={isOutOfStock}
                        className={`w-full py-2 px-3 rounded border font-medium text-sm transition ${
                          isOutOfStock
                            ? 'bg-gray-300 border-gray-300 cursor-not-allowed opacity-50 text-gray-600'
                            : 'bg-white border-gray-300 text-gray-900 hover:border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        View Product
                      </button>
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Navigation Arrows - Desktop Only */}
          {products.length > itemsPerView && (
            <div className="hidden md:flex justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="p-2 border border-gray-300 rounded-full hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex + itemsPerView >= products.length}
                className="p-2 border border-gray-300 rounded-full hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
