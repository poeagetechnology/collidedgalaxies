"use client";

import { Albert_Sans } from "next/font/google";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function QuoteSection() {
  return (
    <section className={`relative bg-gray-100 py-36 z-10 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-4 leading-relaxed sm:leading-snug">
          “Style is a way to say who you are without having to speak.”
        </p>
        <span className="text-lg sm:text-xl text-gray-600 block">– Rachel Zoe</span>
      </div>
    </section>
  );
}
