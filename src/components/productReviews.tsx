'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { Star, MessageCircle } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  photos?: string[];
  createdAt: any;
  verified?: boolean;
}

interface ProductReviewsProps {
  productId: string;
  onOpenReviewModal?: () => void;
}

export default function ProductReviews({ productId, onOpenReviewModal }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);

        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc'),
          limit(5) // Show top 5 reviews
        );

        const snapshot = await getDocs(q);
        const fetchedReviews: Review[] = [];
        let totalRating = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedReviews.push({
            id: doc.id,
            rating: data.rating || 0,
            title: data.title,
            content: data.content,
            author: data.author,
            photos: data.photos,
            createdAt: data.createdAt,
            verified: data.verified,
          });
          totalRating += data.rating || 0;
        });

        setReviews(fetchedReviews);
        setTotalReviews(snapshot.size);

        if (snapshot.size > 0) {
          const avg = (totalRating / snapshot.size).toFixed(1);
          setAverageRating(Number(avg));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="w-full py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className="w-full py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">Customer Reviews</h2>
          <p className="text-gray-600 mb-6">No reviews yet. Be the first to review this product!</p>
          <button
            onClick={onOpenReviewModal}
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Write a Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Customer Reviews</h2>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-black">{averageRating}</span>
              </div>
              <span className="text-gray-600">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <button
            onClick={onOpenReviewModal}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2 mt-4 md:mt-0"
          >
            <MessageCircle size={18} />
            Write Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg border border-gray-200">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {review.author?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-black">{review.author}</p>
                      {review.verified && (
                        <p className="text-xs text-green-600 font-semibold">✓ Verified Purchase</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {review.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Title and Content */}
              <div className="mb-4">
                <h4 className="font-semibold text-black mb-2">{review.title}</h4>
                <p className="text-gray-700 leading-relaxed line-clamp-4">{review.content}</p>
              </div>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-3 mb-4 flex-wrap">
                  {review.photos.slice(0, 3).map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <Image
                        src={photo}
                        alt={`Review photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Reviews Link */}
        {totalReviews > 5 && (
          <div className="text-center mt-8">
            <button
              onClick={onOpenReviewModal}
              className="text-black font-semibold hover:underline"
            >
              View all {totalReviews} reviews →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
