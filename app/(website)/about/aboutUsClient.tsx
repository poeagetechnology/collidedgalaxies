'use client';

import Image from 'next/image';
import Navbar from '../../../src/components/header';
import Footer from '../../../src/components/footer';
import FeaturesBar from '../../../src/components/feature';
import { useEffect, useRef, useState } from 'react';
import { Albert_Sans } from 'next/font/google';
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

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
            <div className={`min-h-screen bg-white ${albertSans.className}`}>

                {/* HERO SECTION */}
                <section className="relative min-h-[60vh] flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="absolute inset-0 opacity-30">
                            <Image
                                src="/fabricTexture.png"
                                alt="subtle fabric texture background"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
                            About Us
                        </h1>
                        <p className="text-md md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                            At Collided Galaxies (COGA), we craft timeless, high-quality garments
                            with thoughtful design and meticulous tailoring — delivering comfort,
                            confidence, and elegance to every wearer.
                        </p>
                    </div>
                </section>

                {/* WHO WE ARE */}
                <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 md:gap-16 items-start">

                        {/* IMAGE LEFT - Image 1 */}
                        <div className="relative h-[400px] md:h-full mt-8 md:mt-0 overflow-hidden order-2 md:order-1">
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
                        </div>

                        {/* TEXT RIGHT */}
                        <div className="space-y-12 order-1 md:order-2">
                            <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                                Who We Are
                            </h2>

                            <p className="text-gray-700 text-lg leading-relaxed">
                                Collided Galaxies (COGA) is a modern clothing brand built on
                                three foundations — quality, detail, and timeless design.
                                We believe true luxury comes from precision, comfort, and the
                                confidence that flows from wearing something made with intention.
                            </p>

                            {/* Image 2 */}
                            <div className="relative h-[150px] md:h-[300px] overflow-hidden">
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
                            </div>
                        </div>
                    </div>
                </section>

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
                            The Art of Timeless Craftsmanship
                        </h2>

                        <p className="text-gray-700 text-lg leading-relaxed mb-16 max-w-3xl">
                            Every COGA garment begins with premium materials. Our craftsmen blend
                            traditional tailoring techniques with modern design to create pieces
                            that last. From fabric selection to finishing touches, each step is
                            carefully executed to ensure durability, comfort, and a refined aesthetic.
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
                            <h3 className="text-4xl md:text-5xl font-light tracking-tight">
                                Redefining Modern Luxury
                            </h3>

                            <p className="text-gray-700 text-lg leading-relaxed italic">
                                We don't chase trends — we create classics.
                            </p>

                            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl ml-auto">
                                Our collections blend contemporary silhouettes with timeless
                                aesthetics, ensuring every piece feels expressive yet versatile.
                                Whether you're dressing for a statement moment or a simple day
                                out, COGA pieces are made to elevate your individuality.
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
                            className="relative h-[400px] md:h-[700px] overflow-hidden mb-12"
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
                                Experience the elegance of authenticity.
                            </p>
                            <p className="text-gray-900 text-xl md:text-2xl">
                                <span className="font-semibold">COGA</span> — Crafted for Those Who Value the Finest.
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
            </div>

            <Footer />
        </>
    );
}