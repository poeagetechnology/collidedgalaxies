// Client-rendered testimonials with animations

'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTestimonialManagement } from "@/src/hooks/useTestimonialManagement";
import TestimonialForm from "./TestimonialForm";

export default function TestimonialsSection() {
  const { testimonials, loading, error, fetchTestimonials } = useTestimonialManagement();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTestimonials(true); // Fetch only approved testimonials
  }, [fetchTestimonials]);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchTestimonials(true);
  };

  if (loading) {
    return (
      <section className="relative w-full bg-white py-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-10">
            <h2 className="text-3xl md:text-4xl md:w-[300px] font-semibold leading-tight mb-2 md:mb-0">
              What Our Customers Say
            </h2>
            <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
              Discover why fashion lovers can't stop talking about COGA!
            </p>
          </div>
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="relative w-full bg-white py-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-10">
            <h2 className="text-3xl md:text-4xl md:w-[300px] font-semibold leading-tight mb-2 md:mb-0">
              What Our Customers Say
            </h2>
            <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
              Be the first to share your experience with COGA!
            </p>
          </div>
          <div className="py-10">
            {!showForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-gray-600 mb-6 text-lg">
                  {error ? 'No testimonials available yet.' : 'Be the first to share your feedback!'}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-block px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold hover:from-gray-800 hover:to-gray-700 transition-all"
                >
                  Share Your Experience
                </button>
              </motion.div>
            ) : (
              <TestimonialForm onSuccess={handleFormSuccess} />
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-white py-12 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Row */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <h2 className="text-3xl md:text-4xl md:w-[300px] font-semibold leading-tight mb-2 md:mb-0">
            What Our Customers Say
          </h2>
          <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
            Discover why fashion lovers can't stop talking about COGA!
          </p>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-10 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#262626] p-5 sm:p-6 text-white flex flex-col justify-between min-h-[180px] sm:min-h-[200px] gap-6 shadow-md transition-transform duration-300 md:hover:scale-[1.02]"
              >
                {/* Stars */}
                <div className="flex space-x-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Image
                      key={j}
                      src="/starIcon.svg"
                      alt="star"
                      width={20}
                      height={20}
                      className="inline-block w-5 h-5"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="mb-3 text-sm sm:text-base leading-relaxed">
                  {t.text}
                </p>

                {/* Author + Date */}
                <div className="text-sm flex justify-between items-center text-gray-100">
                  <span>{t.author}</span>
                  <span className="text-gray-200">{t.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            <p>No testimonials available yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
}