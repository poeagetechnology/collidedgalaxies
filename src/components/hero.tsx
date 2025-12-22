'use client';
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Albert_Sans } from "next/font/google";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
}

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Premium White Sneakers",
      image: "/product1.jpg",
      price: 3999,
      description: "Limited Edition"
    },
    {
      id: "2",
      name: "Black Graphic T-Shirt",
      image: "/product2.jpg",
      price: 1299,
      description: "Summer Collection"
    },
    {
      id: "3",
      name: "Classic Denim Jacket",
      image: "/product3.jpg",
      price: 2499,
      description: "Vintage Style"
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load hero products from Firebase
  useEffect(() => {
    const loadHeroProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const loadedProducts: Product[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (loadedProducts.length < 3) {
            loadedProducts.push({
              id: doc.id,
              name: data.title || data.name || 'Featured Product',
              image: data.image || "/product1.jpg",
              price: data.price || 0,
              description: data.description || "New Arrival"
            });
          }
        });

        if (loadedProducts.length >= 3) {
          setProducts(loadedProducts);
        }
      } catch (error) {
        console.error("Error loading hero products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeroProducts();

    const handleHeroUpdate = () => {
      loadHeroProducts();
    };

    window.addEventListener("hero-updated", handleHeroUpdate);
    return () => window.removeEventListener("hero-updated", handleHeroUpdate);
  }, []);

  const nextSlide = useCallback(() => {
    if (isTransitioning || products.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev + 1) % products.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, products.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || products.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, products.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, products.length]);

  // Calculate responsive product positions
  const getProductPosition = (productIndex: number) => {
    let diff = productIndex - currentIndex;
    
    // Handle wrap-around for left side
    if (diff < -1) diff += products.length;
    // Handle wrap-around for right side
    if (diff > 1) diff -= products.length;

    // Mobile positions
    if (isMobile) {
      if (diff === 0) {
        // Center product (mobile)
        return {
          scale: 1,
          opacity: 1,
          x: 0,
          zIndex: 30,
          className: "h-[280px] w-[200px]",
          showInfo: true
        };
      } else if (diff === -1 || diff === products.length - 1) {
        // Left product (mobile)
        return {
          scale: 0.6,
          opacity: 0.6,
          x: -100,
          zIndex: 20,
          className: "h-[180px] w-[120px]",
          showInfo: false
        };
      } else if (diff === 1 || diff === -(products.length - 1)) {
        // Right product (mobile)
        return {
          scale: 0.6,
          opacity: 0.6,
          x: 100,
          zIndex: 20,
          className: "h-[180px] w-[120px]",
          showInfo: false
        };
      } else {
        // Hidden products
        return {
          scale: 0.3,
          opacity: 0,
          x: diff < 0 ? -150 : 150,
          zIndex: 10,
          className: "h-[180px] w-[120px]",
          showInfo: false
        };
      }
    }

    // Desktop/Tablet positions
    if (diff === 0) {
      // Center product
      return {
        scale: 1.2,
        opacity: 1,
        x: 0,
        zIndex: 30,
        className: "h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] w-[220px] sm:w-[260px] md:w-[300px] lg:w-[340px]",
        showInfo: true
      };
    } else if (diff === -1 || diff === products.length - 1) {
      // Left product
      const xOffset = window.innerWidth < 640 ? -120 : window.innerWidth < 768 ? -160 : window.innerWidth < 1024 ? -200 : -240;
      return {
        scale: 0.7,
        opacity: 0.7,
        x: xOffset,
        zIndex: 20,
        className: "h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]",
        showInfo: false
      };
    } else if (diff === 1 || diff === -(products.length - 1)) {
      // Right product
      const xOffset = window.innerWidth < 640 ? 120 : window.innerWidth < 768 ? 160 : window.innerWidth < 1024 ? 200 : 240;
      return {
        scale: 0.7,
        opacity: 0.7,
        x: xOffset,
        zIndex: 20,
        className: "h-[240px] sm:h-[280px] md:h-[320px] lg:h-[360px] w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]",
        showInfo: false
      };
    } else {
      // Hidden products
      return {
        scale: 0.4,
        opacity: 0,
        x: diff < 0 ? -300 : 300,
        zIndex: 10,
        className: "h-[240px] w-[160px]",
        showInfo: false
      };
    }
  };

  // Calculate product index with wrap-around
  const getProductIndex = (offset: number) => {
    return (currentIndex + offset + products.length) % products.length;
  };

  return (
    <section className={`w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-4 ${albertSans.className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
              <div className="text-gray-500 text-sm sm:text-base">Loading featured products...</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
            {/* Header - Responsive */}
            <motion.div 
              className="text-center space-y-2 sm:space-y-3 md:space-y-4 w-full px-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                Featured Collection
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg max-w-md sm:max-w-lg md:max-w-xl mx-auto">
                Discover our premium selection of curated products
              </p>
            </motion.div>

            {/* 3D Carousel Container - Responsive Height */}
            <div className="relative w-full flex items-center justify-center overflow-visible" style={{ 
              height: isMobile ? '280px' : '380px',
              maxHeight: '50vh'
            }}>
              {/* Background Container */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20 rounded-2xl sm:rounded-3xl" />
              
              {/* Navigation Buttons - Responsive */}
              <button
                onClick={prevSlide}
                disabled={isTransitioning || products.length <= 1}
                className="absolute left-2 sm:left-3 md:left-4 lg:left-6 z-50 p-1.5 sm:p-2 md:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
                aria-label="Previous product"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-900" />
              </button>

              <button
                onClick={nextSlide}
                disabled={isTransitioning || products.length <= 1}
                className="absolute right-2 sm:right-3 md:right-4 lg:right-6 z-50 p-1.5 sm:p-2 md:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
                aria-label="Next product"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-900" />
              </button>

              {/* Render all products at once */}
              {products.map((product, index) => {
                const position = getProductPosition(index);
                
                return (
                  <motion.div
                    key={product.id}
                    className={`absolute ${position.className}`}
                    initial={false}
                    animate={{
                      scale: position.scale,
                      opacity: position.opacity,
                      x: position.x,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                      scale: { duration: 0.5 },
                      opacity: { duration: 0.5 }
                    }}
                    style={{ 
                      zIndex: position.zIndex,
                      cursor: isTransitioning ? "default" : position.scale < 1 ? "pointer" : "default" 
                    }}
                    onClick={() => {
                      if (index !== currentIndex && !isTransitioning) {
                        if (index > currentIndex) {
                          nextSlide();
                        } else {
                          prevSlide();
                        }
                      }
                    }}
                  >
                    <div className={`relative w-full h-full bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden transition-shadow duration-300 ${
                      index === currentIndex ? 'shadow-xl sm:shadow-2xl' : 'shadow-md sm:shadow-lg'
                    }`}>
                      <div className={`absolute inset-0 bg-gradient-to-t ${
                        index === currentIndex 
                          ? 'from-black/30 sm:from-black/40 via-transparent to-transparent' 
                          : 'from-black/10 sm:from-black/20 to-transparent'
                      } z-10`} />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority={index === currentIndex}
                        sizes={isMobile ? "200px" : "(max-width: 768px) 300px, (max-width: 1200px) 340px, 380px"}
                      />
                      
                      {/* Product Info Overlay - Responsive */}
                      {position.showInfo && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8 z-20">
                          <motion.h3 
                            className="text-white text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 line-clamp-1"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {product.name}
                          </motion.h3>
                          <motion.p 
                            className="text-gray-200 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            {product.description}
                          </motion.p>
                          <motion.div 
                            className="flex items-center justify-between"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                          >
                            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white">
                              ₹{product.price.toLocaleString()}
                            </span>
                            <button className="px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 bg-white text-gray-900 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
                              {isMobile ? 'View' : 'View Details'}
                            </button>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Dot Indicators - Responsive */}
              <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 z-40">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
                  {products.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (!isTransitioning && index !== currentIndex) {
                          setIsTransitioning(true);
                          setCurrentIndex(index);
                          setTimeout(() => setIsTransitioning(false), 500);
                        }
                      }}
                      className={`transition-all duration-300 ${
                        index === currentIndex
                          ? "w-4 h-1.5 sm:w-6 sm:h-2 bg-gray-900 rounded-full"
                          : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-300 rounded-full hover:bg-gray-400"
                      }`}
                      disabled={isTransitioning}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-6"
            >
              <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                  Ready to Explore More?
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">
                  Browse our complete collection
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-medium hover:bg-gray-800 transition-all group shadow-lg hover:shadow-xl"
                >
                  {isMobile ? 'Shop Now' : 'Shop All Products'}
                  {!isMobile && (
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="inline-block"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            </motion.div>

            {/* Auto-Slide Indicator */}
            <div className="mt-2 sm:mt-4">
              <div className="w-32 sm:w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gray-900"
                  key={currentIndex}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Auto-rotates every 5 seconds</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}