'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Star, MessageCircle, Upload, X } from 'lucide-react';
import { useAuth } from '@/src/context/authProvider';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  author: string;
  userId: string;
  photos?: string[];
  createdAt: any;
  updatedAt: any;
  verified?: boolean;
}

interface ProductReviewsSectionProps {
  productId: string;
}

export default function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: 5,
    photos: [] as string[],
  });
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoInput, setPhotoInput] = useState('');

  // Fetch reviews from product subcollection
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);

        // Query reviews from product's reviews subcollection
        const reviewsRef = collection(db, `products/${productId}/reviews`);
        const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(5));

        const snapshot = await getDocs(q);
        const fetchedReviews: Review[] = [];
        let totalRating = 0;
        let verifiedCount = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only show verified reviews
          if (data.verified === true) {
            fetchedReviews.push({
              id: doc.id,
              rating: data.rating || 0,
              title: data.title,
              content: data.content,
              author: data.author,
              userId: data.userId,
              photos: data.photos,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              verified: data.verified,
            });
            totalRating += data.rating || 0;
            verifiedCount++;
          }
        });

        setReviews(fetchedReviews);
        setTotalReviews(verifiedCount);

        if (verifiedCount > 0) {
          const avg = (totalRating / verifiedCount).toFixed(1);
          setAverageRating(Number(avg));
        }

        // Check if current user has already reviewed this product
        if (user) {
          const userReviewDoc = snapshot.docs.find(doc => doc.data().userId === user.uid);
          if (userReviewDoc) {
            setHasUserReviewed(true);
            setUserReview({
              id: userReviewDoc.id,
              ...userReviewDoc.data()
            } as Review);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, user]);

  const handleAddPhoto = () => {
    if (photoInput.trim() && formData.photos.length < 5) {
      setFormData({
        ...formData,
        photos: [...formData.photos, photoInput],
      });
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_, i) => i !== index),
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to submit a review');
      return;
    }

    if (hasUserReviewed) {
      alert('You have already submitted a review for this product');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Add review to product's reviews subcollection
      const reviewsRef = collection(db, `products/${productId}/reviews`);
      
      await addDoc(reviewsRef, {
        title: formData.title,
        content: formData.content,
        rating: formData.rating,
        photos: formData.photos,
        author: user.displayName || 'Anonymous',
        userId: user.uid,
        verified: false, // Reviews start as unverified
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        rating: 5,
        photos: [],
      });
      setIsFormOpen(false);

      // Show success message
      alert('Thank you for your review! It will be published after verification by our team.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="w-full py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-gray-200">
          <div className="w-full md:w-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Product Reviews</h2>

            {/* Rating Summary */}
            {totalReviews > 0 && (
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
            )}
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            disabled={hasUserReviewed}
            className={`bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-center ${
              hasUserReviewed ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <MessageCircle size={18} />
            {hasUserReviewed ? 'Review Submitted' : 'Write Review'}
          </button>
        </div>

        {/* User's Pending Review */}
        {hasUserReviewed && userReview && !userReview.verified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">⏳</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 mb-2">Your Review is Pending Verification</h3>
                <div className="bg-white p-4 rounded border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < userReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">• {userReview.createdAt?.toDate?.()?.toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{userReview.title}</h4>
                  <p className="text-gray-700 text-sm">{userReview.content}</p>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Thank you for your review! Our team will verify it before publishing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your review will be published after verification by our team. This helps maintain quality and authenticity.
              </p>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Great quality product"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  maxLength={100}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.content.length}/500</p>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-black mb-2">
                  Add Photos (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    disabled={formData.photos.length >= 5}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Add
                  </button>
                </div>

                {/* Photo Preview */}
                {formData.photos.length > 0 && (
                  <div className="flex gap-3 flex-wrap mb-2">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          src={photo}
                          alt={`Preview ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">{formData.photos.length}/5 photos</p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-400 font-semibold transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* No Reviews Message */}
        {totalReviews === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-lg border border-gray-200">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {review.author?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-black">{review.author}</p>
                        {review.verified && <p className="text-xs text-green-600 font-semibold">✓ Verified Purchase</p>}
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
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
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
        )}

        {/* View All Reviews Link */}
        {totalReviews > 5 && (
          <div className="text-center mt-8">
            <button className="text-black font-semibold hover:underline">View all {totalReviews} reviews →</button>
          </div>
        )}
      </div>
    </div>
  );
}
