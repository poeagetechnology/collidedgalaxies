'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  category?: string;
}

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='800'%20height='800'%3E%3Crect%20fill='%23f3f4f6'%20width='100%25'%20height='100%25'/%3E%3Ctext%20x='50%25'%20y='50%25'%20dominant-baseline='middle'%20text-anchor='middle'%20fill='%23999'%20font-size='24'%3ENo%20image%3C/text%3E%3C/svg%3E";

export default function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerView = 4;

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        // Remove current product and get unique IDs
        const filteredIds = recentlyViewedIds
          .filter((id: string) => id !== currentProductId)
          .slice(0, 8); // Get up to 8 products

        if (filteredIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch products from Firestore using doc IDs
        const products: Product[] = [];
        
        for (const id of filteredIds) {
          try {
            const docRef = doc(db, 'products', id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              products.push({
                id: docSnap.id,
                title: data.title,
                price: data.price || data.discountPriceFirst10Days,
                originalPrice: data.originalPrice,
                image: data.image,
                images: data.images,
                category: data.category
              });
            }
          } catch (err) {
            console.error(`Error fetching product ${id}:`, err);
          }
        }

        setRecentlyViewedProducts(products);
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [currentProductId]);

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < recentlyViewedProducts.length - itemsPerView;

  const handlePrev = () => {
    if (canScrollLeft) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleNext = () => {
    if (canScrollRight) {
      const maxIndex = recentlyViewedProducts.length - itemsPerView;
      setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
    }
  };

  if (loading || recentlyViewedProducts.length === 0) {
    return null;
  }

  const getDiscountPercentage = (product: Product): number | null => {
    if (product.originalPrice && product.price) {
      const originalPrice = Number(product.originalPrice);
      const currentPrice = Number(product.price);
      
      if (!isNaN(originalPrice) && !isNaN(currentPrice) && originalPrice > currentPrice) {
        const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        return discountPercent > 0 ? discountPercent : null;
      }
    }
    return null;
  };

  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Recently Viewed</h2>
        
        <div className="relative">
          {/* Products Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {recentlyViewedProducts.map((product) => {
                const discountPercentage = getDiscountPercentage(product);
                const image = product.images?.[0] || product.image || PLACEHOLDER_IMG;

                return (
                  <div key={product.id} className="w-1/4 shrink-0 px-2">
                    <Link href={`/pdtDetails/${product.id}`} className="block group">
                      <div className="relative bg-gray-200 overflow-hidden mb-4 aspect-3/4 rounded-lg">
                        <Image
                          src={image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {discountPercentage && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            SAVE {discountPercentage}%
                          </div>
                        )}
                        <button className="absolute top-3 left-3 bg-white/80 hover:bg-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                          <Heart size={18} />
                        </button>
                      </div>
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice !== product.price && (
                          <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          {canScrollLeft && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-gray-300 hover:bg-gray-400 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-gray-300 hover:bg-gray-400 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
