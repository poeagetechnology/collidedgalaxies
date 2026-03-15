'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { Product } from '@/src/server/models/product.model';
import { getProductUrl, getCurrentPrice, subscribeToPlainsArrivals } from '@/src/server/services/product.service';
import { ChevronLeft, ChevronRight } from 'lucide-react';import { useCart } from '@/src/context/CartContext';
import toast from 'react-hot-toast';
export default function Plains() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    const unsub = subscribeToPlainsArrivals(setProducts, 8);
    return () => unsub();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const itemsPerView = 2;
    
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = Math.max(0, products.length - itemsPerView);
          if (prevIndex >= maxIndex) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, 4000); // Auto-scroll every 4 seconds
    };

    if (products.length > 0) {
      startAutoScroll();
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [products]);

  const hasAvailableSizes = (product: Product): boolean => {
    return !!(product.sizes && product.sizes.length > 0);
  };

  const itemsPerView = 2;
  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  const nextSlide = () => {
    if (currentIndex + itemsPerView < products.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    // Reset auto-scroll timer when user interacts
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(Math.max(0, products.length - itemsPerView));
    }
    // Reset auto-scroll timer when user interacts
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  return (
    <section className="w-full bg-white py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            PLAINS
            <br />
            <span className="text-blue-600">({products.length})</span>
          </h2>
          <Link href="/products" className="text-gray-600 hover:text-gray-900 text-sm">
            See All
          </Link>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {visibleProducts.length === 0 ? (
              <p className="col-span-full text-center text-lg text-gray-600">No products found.</p>
            ) : (
              visibleProducts.map((product) => {
                const currentPrice = getCurrentPrice(product);
                const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.png';
                const productUrl = getProductUrl(product);
                const isOutOfStock = !hasAvailableSizes(product);
                const discountPercentage = product.originalPrice
                  ? Math.round(((Number(product.originalPrice) - Number(currentPrice)) / Number(product.originalPrice)) * 100)
                  : 0;

                return (
                  <Link href={productUrl} key={product.id}>
                    <div className="flex flex-col group cursor-pointer">
                      {/* Product Image */}
                      <div 
                        className="relative aspect-3/4 bg-gray-100 overflow-hidden mb-4 rounded-lg"
                        onMouseEnter={() => setHoveredProductId(product.id)}
                        onMouseLeave={() => setHoveredProductId(null)}
                      >
                        <Image
                          src={hoveredProductId === product.id && product.images && product.images[1] ? product.images[1] : displayImage}
                          alt={product.title ?? 'product'}
                          fill
                          className={`object-cover object-center transition-transform duration-300 ${
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

                        {/* Discount Badge */}
                        {discountPercentage > 0 && !isOutOfStock && (
                          <span className="absolute top-2 right-2 bg-orange-500 text-white font-semibold px-2 py-1 text-xs z-10">
                            SAVE {discountPercentage}%
                          </span>
                        )}
                      </div>

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

                      {/* View Product Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              productId: product.id,
                              title: product.title,
                              price: Number(getCurrentPrice(product)),
                              image: product.image || product.images?.[0]
                            }, 1);
                            setIsCartOpen(true);
                            toast.success('Added to cart!', { style: { borderRadius: 0 } });
                          }}
                          disabled={isOutOfStock}
                          className={`flex-1 py-2 px-3 rounded border font-medium text-sm transition ${
                            isOutOfStock
                              ? 'bg-gray-300 border-gray-300 cursor-not-allowed opacity-50 text-gray-600'
                              : 'bg-white border-gray-300 text-gray-900 hover:border-black hover:bg-black hover:text-white'
                          }`}
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Buy now functionality
                            window.location.href = productUrl;
                          }}
                          disabled={isOutOfStock}
                          className={`flex-1 py-2 px-3 rounded border font-medium text-sm transition ${
                            isOutOfStock
                              ? 'bg-gray-300 border-gray-300 cursor-not-allowed opacity-50 text-gray-600'
                              : 'bg-black border-black text-white hover:bg-gray-800'
                          }`}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Navigation Arrows */}
          {products.length > itemsPerView && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="p-2 border border-gray-300 rounded-full hover:border-black transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 border border-gray-300 rounded-full hover:border-black transition"
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
