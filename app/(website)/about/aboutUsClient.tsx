'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '../../../src/components/header';
import Footer from '../../../src/components/footer';
import FeaturesBar from '../../../src/components/feature';
import { useEffect, useRef, useState } from 'react';
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AboutPage() {
    const imageRef = useRef<HTMLDivElement>(null);
    const zoomImageRef = useRef<HTMLDivElement>(null);

    const [scale, setScale] = useState(400);
    const [imageScale, setImageScale] = useState(1.3);
    const [aboutImages, setAboutImages] = useState<string[]>([
        "/2G0A8563.jpg",
        "/radio-story.jpg",
        "/2G0A8848.jpg",
        "/landscape1.jpg"
    ]); // default fallback images

    // Load about images from Firebase
    useEffect(() => {
        const loadAboutImages = async () => {
            try {
                const aboutImagesRef = doc(db, "media", "aboutImages");
                const snap = await getDoc(aboutImagesRef);
                
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.images && data.images.length > 0) {
                        setAboutImages(data.images);
                    }
                }
            } catch (error) {
                console.error("Error loading about images:", error);
            }
        };

        loadAboutImages();

        // Listen for real-time updates
        const handleAboutImagesUpdate = () => {
            loadAboutImages();
        };

        window.addEventListener("about-images-updated", handleAboutImagesUpdate);
        return () => window.removeEventListener("about-images-updated", handleAboutImagesUpdate);
    }, []);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let ticking = false;

        const handleScroll = () => {
            // Scale-in effect for Image 3
            if (imageRef.current) {
                const rect = imageRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const scrollProgress = Math.max(
                    0,
                    Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
                );

                const isMobile = window.innerWidth < 768;
                const minScale = isMobile ? 250 : 400;
                const maxScale = isMobile ? 350 : 600;

                const newScale = minScale + (scrollProgress * (maxScale - minScale));
                setScale(Math.min(maxScale, Math.max(minScale, newScale)));
            }

            // Zoom-out effect for Image 4
            if (zoomImageRef.current) {
                const rect = zoomImageRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const scrollProgress = Math.max(
                    0,
                    Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
                );

                const newImageScale = 1.3 - (scrollProgress * 0.3);
                setImageScale(Math.max(1, Math.min(1.3, newImageScale)));
            }
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Navbar />
            <motion.div 
              className="min-h-screen bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >

                {/* HERO SECTION */}
                <motion.section 
                  className="relative min-h-[60vh] flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, margin: "-50px" }}
                >
                    <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200">
                        <div className="absolute inset-0 opacity-30">
                            <Image
                                src="/fabricTexture.png"
                                alt="subtle fabric texture background"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <motion.div 
                      className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: false, margin: "-50px" }}
                    >
                        <motion.h1 
                          className="text-4xl md:text-5xl font-light mb-6 tracking-tight"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          viewport={{ once: false, margin: "-50px" }}
                        >
                            About Us
                        </motion.h1>
                        <motion.p 
                          className="text-md md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          viewport={{ once: false, margin: "-50px" }}
                        >
                            Collided Galaxies was born in March 2024 with a simple but powerful idea.
                            Just like a galaxy exists because millions of stars and planets collide and coexist, our
                            brand is built on connection. The owners, the customers, and the community all come
                            together to form one shared universe.
                        </motion.p>
                    </motion.div>
                </motion.section>

                {/* WHO WE ARE */}
                <motion.section 
                  className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, margin: "-50px" }}
                >
                    <div className="grid md:grid-cols-2 md:gap-16 items-start">

                        {/* IMAGE LEFT - Image 1 */}
                        <motion.div 
                          className="relative h-100 md:h-full mt-8 md:mt-0 overflow-hidden order-2 md:order-1"
                          initial={{ opacity: 0, x: -40 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6 }}
                          viewport={{ once: false, margin: "-50px" }}
                        >
                            {aboutImages[0] && (
                                <Image
                                    src={aboutImages[0]}
                                    alt="model wearing a COGA premium outfit"
                                    fill
                                    className="object-cover"
                                    style={{
                                        objectPosition: "50% 40%"
                                    }}
                                />
                            )}
                        </motion.div>

                        {/* TEXT RIGHT */}
                        <motion.div 
                          className="space-y-12 order-1 md:order-2"
                          initial={{ opacity: 0, x: 40 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6 }}
                          viewport={{ once: false, margin: "-50px" }}
                        >
                            <motion.h2 
                              className="text-4xl md:text-5xl font-light tracking-tight"
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                              viewport={{ once: false, margin: "-50px" }}
                            >
                                The Collision Begins
                            </motion.h2>

                            <motion.p 
                              className="text-gray-700 text-lg leading-relaxed"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              viewport={{ once: false, margin: "-50px" }}
                            >
                                Collided Galaxies isn't just streetwear. It's a reflection of human life.
                                Every design is inspired by real emotions, real struggles, real thoughts, and the everyday
                                moments people live through but rarely speak about. From mindset shifts to inner
                                conflicts, our pieces translate feelings into visuals you can wear.
                                <br /><br />
                                This brand represents collisions. Between dreams and reality. Between who you are and who you're becoming.
                                Between individuality and belonging. That's Collided Galaxies.
                            </motion.p>

                            {/* Image 2 */}
                            <motion.div 
                              className="relative h-37.5 md:h-75 overflow-hidden"
                              initial={{ opacity: 0, scale: 0.9 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.6, delay: 0.3 }}
                              viewport={{ once: false, margin: "-50px" }}
                            >
                                {aboutImages[1] && (
                                    <Image
                                        src={aboutImages[1]}
                                        alt="COGA piece highlighting timeless design"
                                        fill
                                        className="object-cover"
                                        style={{
                                            objectPosition: "50% 35%"
                                        }}
                                    />
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* BRAND STRIP */}
                <div className="bg-black text-white py-4 overflow-hidden my-8">
                    <div className="flex whitespace-nowrap animate-scroll md:animate-scroll-slow">
                        {[...Array(12)].map((_, i) => (
                            <span
                                key={i}
                                className="mx-8 text-base font-light tracking-widest flex items-center gap-16"
                            >
                                <span>Collided Galaxies</span>
                                <span>✦</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* CRAFTSMANSHIP */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-12">
                            Our First Voice Through Product
                        </h2>

                        <p className="text-gray-700 text-lg leading-relaxed mb-16 max-w-3xl">
                            In Collided Galaxies, every design begins with a real human experience.
                            Our first two drops are "Mindset" and "New to the City", both rooted in everyday
                            emotions and life transitions that shape who we become.
                        </p>

                        {/* Image 3 - Scroll-animated */}
                        <div className="flex justify-center mb-16">
                            <div
                                ref={imageRef}
                                className="relative overflow-hidden transition-all duration-300 ease-out"
                                style={{ width: `${scale}px`, height: `${scale}px` }}
                            >
                                {aboutImages[2] && (
                                    <Image
                                        src={aboutImages[2]}
                                        alt="artisan-crafted COGA product photography"
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="text-right space-y-12 pt-12">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
                                    Mindset
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed max-w-3xl ml-auto">
                                    Captures the phase right after college. It reflects the chaos people face stepping into the real world. Love, uncertainty, job
                                    pressure, distractions, bad habits, temptations, and personal struggles all collide at once.
                                    This design represents the journey of navigating that noise and slowly building a strong,
                                    stable mindset despite everything pulling you in different directions.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
                                    New to the City
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed max-w-3xl ml-auto">
                                    Tells a different story. It starts where comfort ends and uncertainty begins. New faces, new streets, fear mixed
                                    with excitement, loneliness mixed with ambition. It reflects the courage it takes to step
                                    into a new city, adapt, survive, and create a life of your own while embracing every
                                    unexpected adventure along the way.
                                </p>
                            </div>

                            <p className="text-gray-700 text-lg leading-relaxed italic max-w-3xl ml-auto">
                                These designs aren't just graphics. They're moments. They're emotions. They're chapters from real lives, translated into streetwear.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FINAL IMAGE + MESSAGE */}
                <section className="py-12">
                    <div>
                        {/* Image 4 - Zoom-out effect */}
                        <div
                            ref={zoomImageRef}
                            className="relative h-100 md:h-175 overflow-hidden mb-12"
                        >
                            {aboutImages[3] && (
                                <Image
                                    src={aboutImages[3]}
                                    alt="COGA t-shirt displayed against a bright sky"
                                    fill
                                    className="object-cover transition-transform duration-300 ease-out"
                                    style={{ transform: `scale(${imageScale})` }}
                                />
                            )}
                        </div>

                        <div className="text-center space-y-1 pt-12 px-4 sm:px-6 lg:px-8">
                            <p className="text-gray-800 text-xl md:text-2xl font-light">
                                That's the essence of Collided Galaxies.
                            </p>
                            <p className="text-gray-900 text-sm md:text-base mt-4">
                                <span className="font-semibold">COGA</span> — Where emotions become wearable art.
                            </p>

                            {/* POLICY LINKS */}
                            <p className="text-sm text-gray-600 mt-6">
                                For details on shipping, returns, and privacy, visit our{' '}
                                <a href="/policies/shipping" className="text-blue-600 hover:underline">Shipping Policy</a>,{' '}
                                <a href="/policies/returns" className="text-blue-600 hover:underline">Return & Refund Policy</a>,{' '}
                                and{' '}
                                <a href="/policies/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
                            </p>
                        </div>
                    </div>
                </section>
                <FeaturesBar />
            </motion.div>

            <Footer />
        </>
    );
}