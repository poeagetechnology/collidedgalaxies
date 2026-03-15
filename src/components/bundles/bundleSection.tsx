"use client";

import React, { useEffect, useState } from "react";
import BundleCard from "./bundleCard";
import type { Bundle } from "@/src/server/models/bundle.model";
import { useCart } from "@/src/context/CartContext";

interface BundleSectionProps {
  title?: string;
  limit?: number;
}

export default function BundleSection({
  title = "Bundle Offers",
  limit,
}: BundleSectionProps) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, try to fetch active bundles
        let response = await fetch("/api/bundles");
        console.log(
          "[BundleSection] Active bundles API Response status:",
          response.status,
        );

        let data = [];

        if (response.ok) {
          data = await response.json();
          console.log(
            "[BundleSection] Active bundles fetched:",
            data.length,
            "bundles",
          );

          // If no active bundles found, try to fetch all bundles (for development/demo)
          if (data.length === 0) {
            console.log(
              "[BundleSection] No active bundles found, trying to fetch all bundles...",
            );
            response = await fetch("/api/bundles?includeInactive=true");
            if (response.ok) {
              data = await response.json();
              console.log(
                "[BundleSection] All bundles fetched (including inactive):",
                data.length,
                "bundles",
              );
            }
          }
        } else if (response.status === 500) {
          // If we get a 500 error (likely composite index issue), try fetching all bundles
          console.warn(
            "[BundleSection] Got 500 error, trying to fetch all bundles as fallback...",
          );
          response = await fetch("/api/bundles?includeInactive=true");
          if (response.ok) {
            data = await response.json();
            console.log(
              "[BundleSection] Fallback: All bundles fetched:",
              data.length,
              "bundles",
            );
          } else {
            console.error(
              "[BundleSection] Fallback API Error:",
              response.status,
            );
            setError("Failed to load bundles");
          }
        } else {
          console.error("[BundleSection] API Error:", response.status);
          setError("Failed to load bundles");
        }

        const displayBundles = limit ? data.slice(0, limit) : data;
        setBundles(displayBundles);
      } catch (err) {
        console.error("[BundleSection] Fetch error:", err);
        setError("Failed to load bundles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundles();
  }, [limit]);

  const handleAddToCart = (
    bundle: Bundle,
    selectedSizes?: Record<string, string>,
  ) => {
    // ✅ Add bundle as a single cohesive item with all metadata preserved
    addToCart({
      bundleId: bundle.id,
      title: bundle.name,
      price: bundle.bundlePrice,
      quantity: 1,
      image: bundle.image || "",
      isBundleItem: true,
      bundleName: bundle.name,
      bundlePrice: bundle.bundlePrice,
      originalIndividualPrice: bundle.originalTotalPrice,
      bundleProductSizes: selectedSizes, // ✅ Include selected sizes
    });

    // Show toast notification instead of alert
    const toast = require("react-hot-toast").default;
    toast.success(
      `✨ "${bundle.name}" added to cart! Saving ₹${(bundle.originalTotalPrice - bundle.bundlePrice).toFixed(2)}`,
    );
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto w-full">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
              {title}
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Get more, save more with our exclusive bundles
            </p>
          </div>
          <div className="flex justify-center items-center h-64 md:h-80">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-sm md:text-base">Loading bundles...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("[BundleSection] Showing error state:", error);
    return (
      <section className="py-12 md:py-20 lg:py-28 px-4 md:px-8 lg:px-12 bg-gray-50/30">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              {title}
            </h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4 text-red-500">⚠️</div>
            <p className="text-red-700 text-lg font-bold">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (bundles.length === 0) {
    console.warn("[BundleSection] No bundles available");
    return (
      <section className="py-12 md:py-20 lg:py-28 px-4 md:px-8 lg:px-12 bg-gray-50/10">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              We're curating something special for you. Stay tuned for amazing
              bundle deals on our best-selling products.
            </p>
          </div>
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 md:p-24 lg:p-32 text-center shadow-sm">
            <div className="text-6xl md:text-8xl mb-8 grayscale hover:grayscale-0 transition-all duration-500">
              📦
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 uppercase tracking-[0.1em]">
              Drops Coming Soon!
            </h3>
            <p className="text-gray-500 text-base md:text-lg mb-8 max-w-md mx-auto">
              Exclusive bundle collections are currently being prepared. Don't
              miss out on our upcoming value drops.
            </p>
            <div className="h-2 w-32 bg-blue-600 mx-auto rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 lg:py-28 px-4 md:px-8 lg:px-12 bg-gray-50/30">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="text-center mb-12 md:mb-16 lg:mb-24">
          <div className="inline-block bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
            Limited Time Offers
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Discover curated collections of our finest products, bundled
            together for exceptional value and style.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
