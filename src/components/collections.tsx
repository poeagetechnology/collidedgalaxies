'use client';
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Albert_Sans } from "next/font/google";
import { useCategoryStorage } from "@/src/hooks/useCategoryStorage";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/src/utils/animations";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CollectionsSection() {
  const { categories, isLoading } = useCategoryStorage();
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

  if (isLoading) {
    return (
      <section className={`relative w-full bg-white py-12 z-10 ${albertSans.className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-lg text-gray-600">Loading collections...</div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className={`relative w-full bg-white py-12 z-10 ${albertSans.className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center w-full mb-10">
            <h2 className="text-3xl md:text-4xl md:w-[250px] text-center md:text-left font-semibold leading-tight mb-2 md:mb-0">
              Our Collections
            </h2>
            <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
              Inspire and let yourself be inspired, from one unique fashion to another.
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-lg text-gray-600">No collections available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative w-full bg-white py-12 z-10 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, margin: "-50px" }}
        >
          <motion.h2
            className="text-3xl md:text-4xl md:w-[250px] text-center md:text-left font-semibold leading-tight mb-2 md:mb-0"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false }}
          >
            Our Collections
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false }}
          >
            Inspire and let yourself be inspired, from one unique fashion to another.
          </motion.p>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          className="mt-10 grid sm:grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
        >
          {categories.map((col, index) => (
            <motion.div
              key={col.id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(col.name)}`}
                onClick={() => {
                  // Reset filters/sort like in Navbar
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('productFilters');
                    sessionStorage.removeItem('productSort');
                  }
                }}
                className="block group cursor-pointer"
              >
                {/* Image Box */}
                <motion.div
                  className="aspect-[3/4] w-full relative overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
                  whileHover={{ boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: false }}
                >
                  {col.imageUrl ? (
                    <motion.div
                      className="w-full h-full relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Image
                        src={col.imageUrl}
                        alt={col.name}
                        fill
                        className={`object-cover object-center transition-transform duration-500 ease-out ${
                          loadedImages[col.id] ? 'group-hover:scale-105' : ''
                        }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        priority={categories.indexOf(col) < 4}
                        onLoad={() =>
                          setLoadedImages((prev) => ({ ...prev, [col.id]: true }))
                        }
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="w-full h-full flex items-center justify-center bg-gray-200"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: false }}
                    >
                      <span className="text-gray-400 text-lg font-medium">No Image</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Category Title */}
                <motion.div
                  className="mt-1 text-base text-left sm:text-xl font-semibold text-gray-900 tracking-wide uppercase"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: false }}
                  whileHover={{ color: "#666" }}
                >
                  {col.name}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}