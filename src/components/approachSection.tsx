'use client';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function ApproachSection() {
  return (
    <section className={`w-full bg-white py-16 md:py-24 ${albertSans.className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 border-l-4 border-black pl-8">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
            OUR APPROACH TO
            <br />
            FASHION DESIGN
          </h2>

          {/* Description */}
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            at elegant vogue, we blend creativity with craftsmanship to create fashion that transcends trends and stands the test of time each design is meticulously crafted, ensuring the highest quality exquisite finish
          </p>
        </div>
      </div>
    </section>
  );
}
