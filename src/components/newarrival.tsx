'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Albert_Sans } from 'next/font/google';
import { Product } from '@/src/server/models/product.model';
import { getProductUrl, getCurrentPrice, subscribeToNewArrivals } from '@/src/server/services/product.service';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const albertSans = Albert_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

type FilterType = 'ALL' | 'Men' | 'Women' | 'KID';
type SortType = 'newest' | 'price-low' | 'price-high';

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productRatings, setProductRatings] = useState<{ [key: string]: { rating: number; count: number } }>({});
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortType>('newest');
  const [displayCount, setDisplayCount] = useState(9);

  // Debug: Check db instance
  useEffect(() => {
    console.log('Firestore db instance:', db);
    if (!db || typeof db !== 'object') {
      throw new Error('Firestore db is not initialized correctly. Check your firebase.ts export and environment variables.');
    }
  }, []);

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

  // Fetch ratings for all products
  useEffect(() => {
    const fetchAllRatings = async () => {
      const ratingsMap: { [key: string]: { rating: number; count: number } } = {};

      for (const product of filteredProducts) {
        try {
          const q = query(
            collection(db, "reviews"),
            where("productId", "==", product.id)
          );

          const querySnapshot = await getDocs(q);
          const reviews: any[] = [];

          querySnapshot.forEach((doc) => {
            reviews.push(doc.data());
          });

          if (reviews.length > 0) {
            const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const avg = total / reviews.length;
            ratingsMap[product.id] = {
              rating: Number(avg.toFixed(1)),
              count: reviews.length
            };
          }
        } catch (error) {
          console.error(`Error fetching ratings for ${product.id}:`, error);
        }
      }

      setProductRatings(ratingsMap);
    };

    if (filteredProducts.length > 0) {
      fetchAllRatings();
    }
  }, [filteredProducts]);

  // Helper function to check if product has sizes
  const hasAvailableSizes = (product: Product): boolean => {
    return !!(product.sizes && product.sizes.length > 0);
  };

  const displayedProducts = filteredProducts.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount((prev) => prev + 9);
  };

  return (
    <section className={`w-full bg-gray-50 py-16 z-10 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-2">
            XIV
            <br />
            COLLECTIONS
            <br />
            23-24
          </h2>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          {/* Category Filters */}
          <div className="flex gap-4 md:gap-8 flex-wrap">
            {(['ALL', 'Men', 'Women', 'KID'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-sm md:text-base font-medium transition-all ${
                  selectedFilter === filter
                    ? 'text-black border-b-2 border-black pb-1'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-4 md:gap-6 flex-wrap md:flex-nowrap">
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
          </div>
        </div>

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
            <p className="col-span-full text-center text-lg text-gray-600">No products found.</p>
          ) : (
            displayedProducts.map((product, idx) => {
              const currentPrice = getCurrentPrice(product);
              const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.png';
              const productUrl = getProductUrl(product);
              const isOutOfStock = !hasAvailableSizes(product);

              return (
                <motion.div 
                  key={product.id} 
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, margin: "-50px" }}
                >
                  <Link href={productUrl} className="group">
                    <motion.div 
                      className="aspect-[3/4] relative w-full overflow-hidden bg-white shadow-sm"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Out of Stock Tag - highest priority */}
                      {isOutOfStock && (
                        <motion.span 
                          className="absolute top-2 left-2 bg-red-600 text-white font-semibold px-3 py-1 text-xs shadow-sm z-10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          OUT OF STOCK
                        </motion.span>
                      )}

                      {/* Combo Tag - only show if in stock */}
                      {!isOutOfStock && product.hasCombos && !!product.comboQuantity && !!product.comboDiscountPrice && (
                        <motion.span 
                          className="absolute top-2 left-2 bg-green-100 text-green-800 font-semibold px-3 py-1 text-xs shadow-sm z-10"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          BUY {product.comboQuantity} @{product.comboDiscountPrice}
                        </motion.span>
                      )}

                      {/* Rating Badge - show if product has ratings */}
                      {!isOutOfStock && productRatings[product.id] && (
                        <motion.div 
                          className="absolute bottom-2 left-2 bg-white text-black font-semibold px-3 py-1 text-xs shadow-sm z-10 flex items-center gap-1"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          viewport={{ once: false, margin: "-50px" }}
                        >
                          <Image
                            src="/starIcon.svg"
                            alt="star"
                            width={12}
                            height={12}
                            className="w-4 h-4"
                          />
                          <span>{productRatings[product.id].rating}</span>
                          <span className="text-green-700">({productRatings[product.id].count})</span>
                        </motion.div>
                      )}

                      <Image
                        src={displayImage}
                        alt={product.title ?? 'product'}
                        fill
                        className={`object-cover object-center transition-transform duration-300 ease-in-out group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''
                          }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </motion.div>
                  </Link>

                  <div className="flex items-end justify-between mt-4">
                    <motion.div 
                      className="flex flex-col"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      viewport={{ once: false, margin: "-50px" }}
                    >
                      <p className="uppercase text-xs mb-2">{product.category}</p>
                      <h3 className="text-xl text-gray-900">{product.title}</h3>
                      {product.originalPrice ? (
                        <p className="text-xl font-semibold text-gray-700 mt-1">
                          ₹{currentPrice}{' '}
                          <span className="line-through text-red-500 ml-2 text-base font-normal">₹{product.originalPrice}</span>
                        </p>
                      ) : (
                        <p className="text-xl font-semibold text-gray-700 mt-1">₹{currentPrice}</p>
                      )}
                    </motion.div>
                    <Link href={productUrl}>
                      <motion.button
                        className={`p-4 transition cursor-pointer active:scale-95 ${isOutOfStock
                            ? 'bg-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-black hover:bg-gray-900'
                          }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Image src="/inclinedArrow.svg" alt="arrow icon" width={14} height={14} />
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Load More Button */}
        {displayCount < filteredProducts.length && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: false, margin: "-50px" }}
          >
            <motion.button
              onClick={loadMore}
              className="text-gray-600 hover:text-gray-900 font-medium flex flex-col items-center gap-2 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              More
              <ChevronDown
                size={20}
                className="group-hover:translate-y-1 transition-transform"
              />
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}