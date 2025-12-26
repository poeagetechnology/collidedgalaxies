'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '@/firebase';
import { Check, X, Image as ImageIcon, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface ProductReview {
  id: string;
  productId: string;
  productTitle?: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  userId: string;
  photos?: string[];
  verified: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('pending');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (loadMore = false) => {
    try {
      setLoading(true);

      // Get all products first to map product IDs to titles
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productMap: { [key: string]: string } = {};
      productsSnapshot.forEach(doc => {
        productMap[doc.id] = doc.data().title || 'Unknown Product';
      });

      // Fetch reviews from all product subcollections
      const allReviews: ProductReview[] = [];

      for (const productDoc of productsSnapshot.docs) {
        const productId = productDoc.id;
        const reviewsRef = collection(db, `products/${productId}/reviews`);

        let q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(20));

        if (loadMore && lastDoc) {
          q = query(reviewsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(20));
        }

        const reviewsSnapshot = await getDocs(q);

        reviewsSnapshot.forEach((reviewDoc) => {
          const data = reviewDoc.data();
          allReviews.push({
            id: reviewDoc.id,
            productId,
            productTitle: productMap[productId],
            rating: data.rating || 0,
            title: data.title,
            content: data.content,
            author: data.author,
            userId: data.userId,
            photos: data.photos,
            verified: data.verified || false,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });

        if (reviewsSnapshot.docs.length > 0) {
          setLastDoc(reviewsSnapshot.docs[reviewsSnapshot.docs.length - 1]);
        }
      }

      // Sort all reviews by creation date
      allReviews.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });

      if (loadMore) {
        setReviews(prev => [...prev, ...allReviews]);
      } else {
        setReviews(allReviews);
      }

      setHasMore(allReviews.length >= 20);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'verified') return review.verified;
    if (filter === 'pending') return !review.verified;
    return true;
  });

  const handleVerify = async (productId: string, reviewId: string) => {
    setVerifying(reviewId);
    try {
      const reviewRef = doc(db, `products/${productId}/reviews`, reviewId);
      await updateDoc(reviewRef, {
        verified: true,
        updatedAt: new Date(),
      });

      // Update local state
      setReviews(prev => prev.map(review =>
        review.id === reviewId ? { ...review, verified: true } : review
      ));
    } catch (error) {
      console.error('Error verifying review:', error);
    } finally {
      setVerifying(null);
    }
  };

  const handleReject = async (productId: string, reviewId: string) => {
    setRejecting(reviewId);
    try {
      const reviewRef = doc(db, `products/${productId}/reviews`, reviewId);
      await deleteDoc(reviewRef);

      // Update local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error rejecting review:', error);
    } finally {
      setRejecting(null);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Reviews Management</h1>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Reviews', count: reviews.length },
            { key: 'pending', label: 'Pending', count: reviews.filter(r => !r.verified).length },
            { key: 'verified', label: 'Verified', count: reviews.filter(r => r.verified).length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found in this category.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={`${review.productId}-${review.id}`} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {review.author?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.author}</p>
                      <p className="text-sm text-gray-600">
                        Product: {review.productTitle} • {review.createdAt?.toDate?.()?.toLocaleDateString()}
                      </p>
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
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    {!review.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </span>
                    )}
                    {review.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!review.verified && (
                    <button
                      onClick={() => handleVerify(review.productId, review.id)}
                      disabled={verifying === review.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={16} />
                      {verifying === review.id ? 'Verifying...' : 'Verify'}
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review.productId, review.id)}
                    disabled={rejecting === review.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <X size={16} />
                    {rejecting === review.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-700 leading-relaxed">{review.content}</p>
              </div>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-3 flex-wrap">
                  {review.photos.map((photo, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={photo}
                        alt={`Review photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && filteredReviews.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={() => fetchReviews(true)}
            disabled={loading}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
}