// Client-rendered testimonials with animations

'use client';

import { Albert_Sans } from "next/font/google";
import Image from "next/image";
import { motion } from "framer-motion";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


const testimonials = [
  {
    rating: 5,
    text: "This outfit feels incredibly premium for the price. The fabric is soft, durable, and perfect for the weather — totally worth it.",
    author: "Vikram S.",
    date: "04 Sep 2023",
  },
  {
    rating: 5,
    text: "I love the way their shirts fit — not too tight, not too loose. The minimal design makes it easy to wear for both work and casual outings.",
    author: "Aaliya M.",
    date: "12 Oct 2023",
  },
  {
    rating: 5,
    text: "COGA has become one of the few brands I trust for quality. Their collections feel modern, and the comfort is next level.",
    author: "Rishi P.",
    date: "22 Oct 2023",
  },
  {
    rating: 5,
    text: "Their pieces have this clean, premium look that just stands out. Even after several washes, the fabric still feels new.",
    author: "Nisha K.",
    date: "30 Oct 2023",
  },
  {
    rating: 5,
    text: "COGA has nailed the blend between quality and simplicity. Highly recommend!",
    author: "Ryan T.",
    date: "05 Nov 2023",
  },
  {
    rating: 5,
    text: "Really impressed with the fit and finish. COGA consistently delivers great basics that look sharp without being flashy.",
    author: "Kunal R..",
    date: "15 Nov 2023",
  },
];

export default function TestimonialsSection() {
  return (
    <section className={`relative w-full bg-white py-12 z-10 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Row */}
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <h2 className="text-3xl md:text-4xl md:w-[300px] font-semibold leading-tight mb-2 md:mb-0">
            What Our Customers Say
          </h2>
          <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
            Discover why fashion lovers can’t stop talking about COGA!
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-10 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#262626] p-5 sm:p-6 text-white flex flex-col justify-between min-h-[180px] sm:min-h-[200px] gap-6 shadow-md transition-transform duration-300 md:hover:scale-[1.02]"
            >
              {/* Stars */}
              <div className="flex space-x-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Image
                    key={j}
                    src="/starIcon.svg"
                    alt="star"
                    width={20}     // matches w-5 (20px)
                    height={20}    // matches h-5 (20px)
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}