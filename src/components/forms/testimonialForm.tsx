'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { useTestimonialManagement } from '@/src/hooks/useTestimonialManagement';

interface TestimonialFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestimonialForm({ isOpen, onClose }: TestimonialFormProps) {
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { addTestimonial } = useTestimonialManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!author.trim() || !text.trim()) {
        setError('Please fill in all fields');
        return;
      }

      await addTestimonial({
        rating,
        text,
        author,
        date,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setRating(5);
        setAuthor('');
        setText('');
        setDate(new Date().toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        {success ? (
          <div className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-2xl">✓</span>
            </motion.div>
            <p className="text-gray-900 font-semibold">Thank you!</p>
            <p className="text-gray-600 text-sm mt-2">Your testimonial has been submitted and is pending admin approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className="transition"
                  >
                    <Star
                      size={24}
                      className={r <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="John Doe"
              />
            </div>

            {/* Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Testimonial *
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Share your experience with COGA..."
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your testimonial will be reviewed by our team before appearing on the website.
            </p>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
