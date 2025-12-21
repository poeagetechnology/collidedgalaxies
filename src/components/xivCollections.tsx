'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Albert_Sans } from 'next/font/google';
import { Product } from '@/src/server/models/product.model';
import { getProductUrl, getCurrentPrice, subscribeToNewArrivals } from '@/src/server/services/product.service';
import { ChevronDown } from 'lucide-react';

const albertSans = Albert_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

type FilterType = 'ALL' | 'Men' | 'Women' | 'KID';
type SortType = 'newest' | 'price-low' | 'price-high';

export default function XIVCollections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortType>('newest');
  const [displayCount, setDisplayCount] = useState(9);

  // Load products from Firebase
  useEffect(() => {
    const unsub = subscribeToNewArrivals(setProducts, 50);
    return () => unsub();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedFilter !== 'ALL') {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = Number(getCurrentPrice(a)) || 0;
          const priceB = Number(getCurrentPrice(b)) || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = Number(getCurrentPrice(a)) || 0;
          const priceB = Number(getCurrentPrice(b)) || 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
      default:
        // Keep original order (newest first)
        break;
    }

    setFilteredProducts(filtered);
    setDisplayCount(9); // Reset display count when filter/sort changes
  }, [products, selectedFilter, selectedSort]);

  const hasAvailableSizes = (product: Product): boolean => {
    return !!(product.sizes && product.sizes.length > 0);
  };

  const displayedProducts = filteredProducts.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 9);
  };

  return (
    <motion.section 
      className={`w-full bg-gray-50 py-16 ${albertSans.className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, margin: "-50px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-50px" }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold leading-tight mb-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            XIV
            <br />
            COLLECTIONS
            <br />
            23-24
          </motion.h2>
        </motion.div>

        {/* Filters and Sort */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: false, margin: "-50px" }}
        >
          {/* Category Filters */}
          <motion.div 
            className="flex gap-4 md:gap-8 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {(['ALL', 'Men', 'Women', 'KID'] as FilterType[]).map((filter) => (
              <motion.button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-sm md:text-base font-medium transition-all ${
                  selectedFilter === filter
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-gray-500 hover:text-black'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter}
              </motion.button>
            ))}
          </motion.div>

          {/* Sort Options */}
          <motion.div 
            className="flex gap-4 md:gap-6 flex-wrap md:flex-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-1 text-xs md:text-sm cursor-pointer group">
              <span className="font-medium">Filter(s)</span>
              <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
            </div>
            <div className="flex items-center gap-1 text-xs md:text-sm cursor-pointer group">
              <span className="font-medium">Sort(s)</span>
              <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
            </div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortType)}
              className="text-xs md:text-sm font-medium appearance-none cursor-pointer bg-transparent border-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Less to more</option>
              <option value="price-high">More to Less</option>
            </select>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12"
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
          viewport={{ once: false, margin: "-50px" }}
        >
          {displayedProducts.length === 0 ? (
            <motion.p 
              className="col-span-full text-center text-lg text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              No products found.
            </motion.p>
          ) : (
            displayedProducts.map((product) => {
              const currentPrice = getCurrentPrice(product);
              const displayImage =
                product.image ||
                (product.images && product.images[0]) ||
                '/placeholder.png';
              const productUrl = getProductUrl(product);
              const isOutOfStock = !hasAvailableSizes(product);

              return (
                <div key={product.id} className="flex flex-col group">
                  {/* Product Image */}
                  <Link href={productUrl}>
                    <div className="relative aspect-square bg-white overflow-hidden mb-4 cursor-pointer">
                      <Image
                        src={displayImage}
                        alt={product.title ?? 'product'}
                        fill
                        className={`object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
                          isOutOfStock ? 'opacity-60 grayscale' : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Out of Stock Tag */}
                      {isOutOfStock && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white font-semibold px-2 py-1 text-xs z-10">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 uppercase mb-2">
                      {product.category}
                    </p>
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {product.title}
                    </h3>
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-gray-900">
                        ₹{currentPrice}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs line-through text-gray-500">
                          ₹{product.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>

        {/* Load More Button */}
        {displayCount < filteredProducts.length && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              className="text-gray-600 hover:text-gray-900 font-medium flex flex-col items-center gap-2 group cursor-pointer"
            >
              More
              <ChevronDown
                size={20}
                className="group-hover:translate-y-1 transition-transform"
              />
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}
