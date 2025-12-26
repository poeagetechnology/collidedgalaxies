"use client";

export default function QuoteSection() {
  return (
    <section className="relative bg-gray-100 py-36 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-4 leading-relaxed sm:leading-snug">
          “Style is a way to say who you are without having to speak.”
        </p>
        <span className="text-lg sm:text-xl text-gray-600 block">– Rachel Zoe</span>
      </div>
    </section>
  );
}
