'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { useTestimonialManagement } from '@/src/hooks/useTestimonialManagement';
import { useAuth } from '../hooks/useAuth';

interface TestimonialFormProps {
  onSuccess?: () => void;
}

export default function TestimonialForm({ onSuccess }: TestimonialFormProps) {
  const { user } = useAuth();
  const { addTestimonial, loading } = useTestimonialManagement();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Sign In to Share Your Experience</h3>
        <p className="text-blue-800 mb-4">Please log in to post your testimonial and help our community.</p>
        <a
          href="/signin"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
        </a>
      </motion.div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h3>
        <p className="text-green-800 mb-6">
          Your testimonial has been submitted successfully.
          {!isVisible && ' It will be visible after admin approval.'}
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setFeedback('');
            setRating(5);
            setIsVisible(true);
            onSuccess?.();
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
        >
          Post Another Review
        </button>
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!feedback.trim()) {
      setError('Please write your feedback');
      return;
    }

    if (feedback.trim().length < 10) {
      setError('Feedback must be at least 10 characters');
      return;
    }

    try {
      await addTestimonial({
        author: user.displayName || user.email || 'Anonymous',
        text: feedback,
        rating,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        userId: user.uid,
        approved: isVisible,
      });

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit testimonial');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto bg-white border-2 border-gray-200 rounded-2xl p-8"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h3>
      <p className="text-gray-600 mb-6">Help other customers by sharing your honest feedback about COGA products</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Your Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="focus:outline-none transition-transform"
              >
                <Star
                  size={32}
                  className={`transition-colors duration-200 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        {/* Feedback Section */}
        <div>
          <label htmlFor="feedback" className="block text-sm font-semibold text-gray-900 mb-2">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience with COGA products... (minimum 10 characters)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none resize-none transition-colors"
            rows={5}
            maxLength={500}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              {feedback.length}/500 characters
            </p>
            {feedback.length < 10 && feedback.length > 0 && (
              <p className="text-xs text-red-500">At least 10 characters required</p>
            )}
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="visibility"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-gray-900"
            />
            <label htmlFor="visibility" className="cursor-pointer flex-1">
              <p className="font-medium text-gray-900">Make visible immediately</p>
              <p className="text-xs text-gray-600">
                {isVisible
                  ? 'Your testimonial will be visible right away'
                  : 'Your testimonial will be reviewed before appearing'}
              </p>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !feedback.trim() || feedback.trim().length < 10}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send size={20} />
              Post Testimonial
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
