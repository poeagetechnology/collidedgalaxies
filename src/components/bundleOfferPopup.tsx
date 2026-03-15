"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { Bundle } from "@/src/server/models/bundle.model";

interface EnrichedBundle extends Bundle {
  productTitles?: string[];
}

export default function BundleOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [bundle, setBundle] = useState<EnrichedBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch a random bundle on mount
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/bundles");
        if (response.ok) {
          const bundles = await response.json();
          console.log("[BundleOfferPopup] Bundles fetched:", bundles.length);
          if (bundles.length > 0) {
            // Select a random bundle
            const randomBundle = bundles[
              Math.floor(Math.random() * bundles.length)
            ] as EnrichedBundle;
            console.log(
              "[BundleOfferPopup] Selected bundle:",
              randomBundle.name,
            );

            // Fetch product details from Firestore to get titles
            if (randomBundle.products && randomBundle.products.length > 0) {
              try {
                const productTitles = await Promise.all(
                  randomBundle.products.map(async (product) => {
                    try {
                      const productRef = doc(db, "products", product.productId);
                      const productSnap = await getDoc(productRef);
                      if (productSnap.exists()) {
                        const productData = productSnap.data();
                        console.log(
                          `[BundleOfferPopup] Product ${product.productId}:`,
                          productData.title,
                        );
                        return productData.title || "Product";
                      }
                      return "Product";
                    } catch (error) {
                      console.error(
                        `[BundleOfferPopup] Error fetching product ${product.productId}:`,
                        error,
                      );
                      return "Product";
                    }
                  }),
                );
                randomBundle.productTitles = productTitles;
                console.log(
                  "[BundleOfferPopup] Product titles loaded:",
                  productTitles,
                );
              } catch (error) {
                console.error(
                  "[BundleOfferPopup] Error fetching product titles:",
                  error,
                );
              }
            }

            setBundle(randomBundle);
          }
        }
      } catch (error) {
        console.error("[BundleOfferPopup] Error fetching bundles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Show popup after bundle is loaded
  useEffect(() => {
    console.log(
      "[BundleOfferPopup] Effect triggered - bundle loaded:",
      !!bundle,
    );
    if (bundle && !sessionStorage.getItem("bundle-offer-popup-seen")) {
      console.log("[BundleOfferPopup] Setting timeout for popup display");
      const timer = setTimeout(() => {
        console.log("[BundleOfferPopup] Opening popup");
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bundle]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("bundle-offer-popup-seen", "true");
  };

  const handleViewBundles = () => {
    handleClose();
    router.push("/products?category=bundles");
  };

  if (!isOpen || !bundle) {
    console.log(
      "[BundleOfferPopup] Not rendering - isOpen:",
      isOpen,
      "bundle:",
      !!bundle,
    );
    return null;
  }

  const discount = bundle.discount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discount}% OFF
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 md:p-2.5 bg-white hover:bg-gray-100 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          title="Close"
          aria-label="Close popup"
        >
          <X
            size={28}
            className="text-gray-700 hover:text-gray-900"
            strokeWidth={2.5}
          />
        </button>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {/* Logo */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Collided <span className="text-blue-600">Galaxies</span>
            </h2>
          </div>

          {/* Heading */}
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
            🎁 Limited Bundle Offer
          </h3>

          {/* Bundle Details */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-3">
              {bundle.description ||
                "Get exclusive bundle deals with amazing discounts!"}
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-gray-900 text-sm mb-2">
                {bundle.name}
              </h4>
              <div className="flex items-baseline justify-between">
                <div>
                  {bundle.originalTotalPrice && (
                    <span className="text-gray-500 line-through text-sm mr-2">
                      ₹{bundle.originalTotalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{bundle.bundlePrice.toLocaleString("en-IN")}
                  </span>
                </div>
                {discount > 0 && (
                  <span className="text-red-600 font-bold text-lg">
                    Save {discount}%
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-xs">
              ✓ Free Shipping on orders above ₹500
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleViewBundles}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Explore All Bundles →
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleClose}
            className="w-full mt-2 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
