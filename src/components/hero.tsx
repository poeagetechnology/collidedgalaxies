'use client';
import { useEffect, useState } from "react";
import Image from "next/image";
import { Albert_Sans } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  slideInFromLeftVariants,
  slideInFromRightVariants,
} from "@/src/utils/animations";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Premium White Sneakers",
      image: "/product1.jpg",
      price: 3999,
    },
    {
      id: "2",
      name: "Black Graphic T-Shirt",
      image: "/product2.jpg",
      price: 1299,
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Load hero products from Firebase
  useEffect(() => {
    const loadHeroProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const loadedProducts: Product[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.featured || loadedProducts.length < 2) {
            loadedProducts.push({
              id: doc.id,
              name: data.name || 'Featured Product',
              image: data.image || "/product1.jpg",
              price: data.price || 0,
            });
          }
        });

        if (loadedProducts.length > 0) {
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error("Error loading hero products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroProducts();

    // Listen for real-time updates
    const handleHeroUpdate = () => {
      loadHeroProducts();
    };

    window.addEventListener("hero-updated", handleHeroUpdate);
    return () => window.removeEventListener("hero-updated", handleHeroUpdate);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`w-full bg-white pt-12 md:pt-16 pb-12 md:pb-16 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            {/* Left Section - Text Content */}
            <motion.div
              className="flex flex-col justify-center space-y-6 order-2 md:order-1"
              variants={slideInFromLeftVariants}
            >
              {/* Collection Title */}
              <motion.div
                variants={itemVariants}
              >
                <motion.h1
                  className="text-5xl md:text-6xl font-bold text-black leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: false }}
                >
                  NEW
                </motion.h1>
                <motion.h2
                  className="text-5xl md:text-6xl font-bold text-black leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: false }}
                >
                  COLLECTION
                </motion.h2>
              </motion.div>

              {/* Season Info */}
              <motion.div
                variants={itemVariants}
              >
                <motion.p
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: false }}
                >
                  Summer
                </motion.p>
                <motion.p
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: false }}
                >
                  2024
                </motion.p>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                variants={itemVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-3 hover:bg-gray-800 transition-colors group"
                  >
                    Go To Shop
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ChevronRight size={20} />
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Section - Product Carousel */}
            <motion.div
              className="order-1 md:order-2 space-y-6"
              variants={slideInFromRightVariants}
            >
              {/* Main Product Image */}
              <motion.div
                className="relative bg-gray-100 aspect-square overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: false }}
                whileHover={{ scale: 1.02 }}
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === currentSlide ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name || 'Featured product'}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                ))}

                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                  <motion.button
                    onClick={prevSlide}
                    className="bg-white/80 hover:bg-white p-2 rounded-full transition-all"
                    whileHover={{ scale: 1.1, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Previous product"
                  >
                    <ChevronLeft size={24} className="text-gray-900" />
                  </motion.button>
                  <motion.button
                    onClick={nextSlide}
                    className="bg-white/80 hover:bg-white p-2 rounded-full transition-all"
                    whileHover={{ scale: 1.1, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Next product"
                  >
                    <ChevronRight size={24} className="text-gray-900" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Product Info */}
              <motion.div
                className="text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: false }}
              >
                <motion.h3
                  className="text-lg font-semibold text-gray-900"
                  key={products[currentSlide].id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {products[currentSlide].name}
                </motion.h3>
                <motion.p
                  className="text-xl font-bold text-gray-900"
                  key={`price-${products[currentSlide].id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  ₹{products[currentSlide].price.toLocaleString()}
                </motion.p>
              </motion.div>

              {/* Dot Indicators */}
              <motion.div
                className="flex justify-center md:justify-start gap-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: false }}
              >
                {products.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-gray-900 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      width: index === currentSlide ? 32 : 8,
                      transition: { duration: 0.3 },
                    }}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}