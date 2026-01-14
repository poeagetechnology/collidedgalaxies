'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { Heart, ShoppingBag, Star } from 'lucide-react';

interface RelatedProduct {
  id: string;
  title: string;
  price?: number;
  discountPriceFirst10Days?: number;
  image?: string;
  images?: string[];
  slug?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

interface RelatedProductsProps {
  currentProductId: string;
  currentCategory?: string;
}

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='300'%20height='300'%3E%3Crect%20fill='%23f3f4f6'%20width='100%25'%20height='100%25'/%3E%3Ctext%20x='50%25'%20y='50%25'%20dominant-baseline='middle'%20text-anchor='middle'%20fill='%23999'%20font-size='16'%3ENo%20image%3C/text%3E%3C/svg%3E";

export default function RelatedProducts({ currentProductId, currentCategory }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch 6 related products (same category, excluding current product)
        const q = query(
          collection(db, 'products'),
          where('category', '==', currentCategory),
          limit(7) // Get 7 to exclude current product
        );

        const snapshot = await getDocs(q);
        const products: RelatedProduct[] = [];

        snapshot.forEach((doc) => {
          if (doc.id !== currentProductId) {
            const data = doc.data();
            products.push({
              id: doc.id,
              title: data.title,
              price: data.price,
              discountPriceFirst10Days: data.discountPriceFirst10Days,
              image: data.image,
              images: data.images,
              slug: data.slug,
              category: data.category,
            });
          }
        });

        // If less than 6 related products found, fetch more from other categories
        if (products.length < 6) {
          const remainingNeeded = 6 - products.length;
          const q2 = query(
            collection(db, 'products'),
            limit(remainingNeeded)
          );

          const snapshot2 = await getDocs(q2);
          snapshot2.forEach((doc) => {
            if (doc.id !== currentProductId && !products.find(p => p.id === doc.id)) {
              const data = doc.data();
              products.push({
                id: doc.id,
                title: data.title,
                price: data.price,
                discountPriceFirst10Days: data.discountPriceFirst10Days,
                image: data.image,
                images: data.images,
                slug: data.slug,
                category: data.category,
              });
            }
          });
        }

        // Fetch reviews for each product to get ratings
        const productsWithRatings = await Promise.all(
          products.slice(0, 6).map(async (product) => {
            const reviewsQuery = query(
              collection(db, 'reviews'),
              where('productId', '==', product.id)
            );
            const reviewsSnapshot = await getDocs(reviewsQuery);
            
            let totalRating = 0;
            reviewsSnapshot.forEach((doc) => {
              totalRating += doc.data().rating || 0;
            });

            const avgRating = reviewsSnapshot.size > 0 ? (totalRating / reviewsSnapshot.size).toFixed(1) : 0;

            return {
              ...product,
              rating: Number(avgRating),
              reviewCount: reviewsSnapshot.size,
            };
          })
        );

        setRelatedProducts(productsWithRatings);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentCategory) {
      fetchRelatedProducts();
    }
  }, [currentProductId, currentCategory]);

  if (isLoading) {
    return (
      <div className="w-full py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-black">You Might Also Like</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((product) => {
            const displayPrice = product.discountPriceFirst10Days || product.price || 0;
            const productImage = product.image || product.images?.[0] || PLACEHOLDER_IMG;

            return (
              <Link key={product.id} href={`/pdtDetails/${product.slug || product.id}`}>
                <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col">
                  {/* Image Container */}
                  <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                    <Image
                      src={productImage}
                      alt={product.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                      <Heart size={18} className="text-red-600" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2 text-black">
                        {product.title}
                      </h3>

                      {/* Rating */}
                      {(product.reviewCount ?? 0) > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.round(product.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({product.reviewCount ?? 0})</span>
                        </div>
                      )}
                    </div>

                    {/* Price and Button */}
                    <div>
                      <div className="mb-3">
                        <p className="font-bold text-lg md:text-xl text-black">
                          ₹{(displayPrice ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <button className="w-full bg-black text-white py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors text-sm">
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
