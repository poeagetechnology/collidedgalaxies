'use client';
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

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
          if (loadedProducts.length < 7) {
            loadedProducts.push({
              id: doc.id,
              name: data.title || data.name || 'Featured Product',
              image: data.image || "/product1.jpg",
              price: data.price || 0,
              description: data.description || "New Arrival"
            });
          }
        });

        if (loadedProducts.length >= 1) {
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
    if (diff < -3) diff += products.length;
    // Handle wrap-around for right side
    if (diff > 3) diff -= products.length;

    // Mobile positions - show 1 center + 2 on sides
    if (isMobile) {
      if (diff === 0) {
        return {
          scale: 1,
          opacity: 1,
          x: 0,
          zIndex: 30,
          className: "h-[280px] w-[200px]",
          showInfo: true
        };
      } else if (diff === -1 || diff === products.length - 1) {
        return {
          scale: 0.6,
          opacity: 0.6,
          x: -110,
          zIndex: 20,
          className: "h-[180px] w-[120px]",
          showInfo: false
        };
      } else if (diff === 1 || diff === -(products.length - 1)) {
        return {
          scale: 0.6,
          opacity: 0.6,
          x: 110,
          zIndex: 20,
          className: "h-[180px] w-[120px]",
          showInfo: false
        };
      } else if (diff === -2 || diff === products.length - 2) {
        return {
          scale: 0.4,
          opacity: 0.4,
          x: -220,
          zIndex: 15,
          className: "h-[140px] w-[100px]",
          showInfo: false
        };
      } else if (diff === 2 || diff === -(products.length - 2)) {
        return {
          scale: 0.4,
          opacity: 0.4,
          x: 220,
          zIndex: 15,
          className: "h-[140px] w-[100px]",
          showInfo: false
        };
      } else {
        return {
          scale: 0.2,
          opacity: 0,
          x: diff < 0 ? -330 : 330,
          zIndex: 10,
          className: "h-[140px] w-[100px]",
          showInfo: false
        };
      }
    }

    // Desktop/Tablet positions - show all 7 in a horizontal scroll
    const positions: { [key: string]: any } = {
      "0": {
        scale: 1.2,
        opacity: 1,
        x: 0,
        zIndex: 30,
        className: "h-[320px] sm:h-[340px] md:h-[320px] lg:h-[340px] w-[220px] sm:w-[240px] md:w-[220px] lg:w-[240px]",
        showInfo: true
      },
      "-1": {
        scale: 0.95,
        opacity: 0.85,
        x: -130,
        zIndex: 29,
        className: "h-[300px] sm:h-[320px] md:h-[300px] lg:h-[320px] w-[200px] sm:w-[220px] md:w-[200px] lg:w-[220px]",
        showInfo: false
      },
      "1": {
        scale: 0.95,
        opacity: 0.85,
        x: 130,
        zIndex: 29,
        className: "h-[300px] sm:h-[320px] md:h-[300px] lg:h-[320px] w-[200px] sm:w-[220px] md:w-[200px] lg:w-[220px]",
        showInfo: false
      },
      "-2": {
        scale: 0.8,
        opacity: 0.7,
        x: -250,
        zIndex: 28,
        className: "h-[280px] sm:h-[300px] md:h-[280px] lg:h-[300px] w-[180px] sm:w-[200px] md:w-[180px] lg:w-[200px]",
        showInfo: false
      },
      "2": {
        scale: 0.8,
        opacity: 0.7,
        x: 250,
        zIndex: 28,
        className: "h-[280px] sm:h-[300px] md:h-[280px] lg:h-[300px] w-[180px] sm:w-[200px] md:w-[180px] lg:w-[200px]",
        showInfo: false
      },
      "-3": {
        scale: 0.65,
        opacity: 0.55,
        x: -360,
        zIndex: 27,
        className: "h-[260px] sm:h-[280px] md:h-[260px] lg:h-[280px] w-[160px] sm:w-[180px] md:w-[160px] lg:w-[180px]",
        showInfo: false
      },
      "3": {
        scale: 0.65,
        opacity: 0.55,
        x: 360,
        zIndex: 27,
        className: "h-[260px] sm:h-[280px] md:h-[260px] lg:h-[280px] w-[160px] sm:w-[180px] md:w-[160px] lg:w-[180px]",
        showInfo: false
      }
    };

    return positions[diff.toString()] || {
      scale: 0.4,
      opacity: 0,
      x: diff < 0 ? -500 : 500,
      zIndex: 10,
      className: "h-[260px] w-[160px]",
      showInfo: false
    };
  };

  // Calculate product index with wrap-around
  const getProductIndex = (offset: number) => {
    return (currentIndex + offset + products.length) % products.length;
  };

  return (
    <section className="w-full min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
              <div className="text-gray-500 text-sm sm:text-base">Loading featured products...</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-center w-full">
            {/* Carousel Section */}
            <div className="w-full flex justify-center relative">
              {/* Mobile Header - Positioned above carousel */}
              {isMobile && (
                <motion.div 
                  className="absolute top-0 left-0 right-0 text-center space-y-1 z-50 px-2 mb-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                    Featured Collection
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm max-w-sm mx-auto">
                    Discover our premium selection
                  </p>
                </motion.div>
              )}

              {/* 3D Carousel Container - Responsive Height */}
              <div className="relative w-full md:w-auto flex items-center justify-center overflow-visible" style={{ 
              height: isMobile ? '320px' : '420px',
              maxHeight: '50vh',
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? 'auto' : '900px',
              marginTop: isMobile ? '60px' : '0px'
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
                            className="text-white text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 line-clamp-1"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {product.name}
                          </motion.h3>
                          <motion.div 
                            className="flex items-center justify-center"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.08, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                href={`/pdtDetails/${product.id}`}
                                className="inline-flex items-center gap-2 px-8 py-3 sm:px-9 sm:py-3.5 md:px-10 md:py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full text-sm sm:text-base font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 whitespace-nowrap shadow-lg"
                              >
                                <span>Buy Now</span>
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </motion.div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Dot Indicators - Responsive */}
              <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 z-40">
                <div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-xl">
                  {products.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        if (!isTransitioning && index !== currentIndex) {
                          setIsTransitioning(true);
                          setCurrentIndex(index);
                          setTimeout(() => setIsTransitioning(false), 500);
                        }
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentIndex
                          ? "w-6 h-2.5 sm:w-8 sm:h-3 bg-gradient-to-r from-gray-900 to-gray-700 shadow-md"
                          : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-300 hover:bg-gray-500"
                      }`}
                      disabled={isTransitioning}
                      aria-label={`Go to slide ${index + 1}`}
                      whileHover={index !== currentIndex ? { scale: 1.2 } : undefined}
                      whileTap={index !== currentIndex ? { scale: 0.9 } : undefined}
                    />
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}