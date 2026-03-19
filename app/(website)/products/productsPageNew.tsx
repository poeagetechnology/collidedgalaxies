"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { db } from "@/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  ChevronDown,
  ChevronLeft,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";
import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
// DISABLED: Bundle section import
// import BundleSection from "../../../src/components/bundles/bundleSection";

type Product = {
  id: string;
  title?: string;
  slug?: string;
  image?: string;
  images?: string[];
  price?: string;
  originalPrice?: string;
  discountedPrice?: string;
  discountPriceFirst10Days?: string;
  discountPriceAfter10Days?: string;
  category?: string;
  sizes?: string[];
  colors?: Array<{ name: string; hex: string }>;
  description?: string;
  createdAt?: any;
  sizeChart?: string;
  sizeChartName?: string;
  inventory?: Record<string, number>;
  variants?: any[];
  hasCombos?: boolean;
  basePrice?: string;
  costPrice?: string;
  gst?: string;
  priceFirst10Days?: string;
  priceAfter10Days?: string;
  numericId?: number;
};

// Helper function to check if product is "plain"
const isPlainProduct = (product: Product): boolean => {
  return (
    (product.title || "").toLowerCase().includes("plain") ||
    (product.slug || "").toLowerCase().includes("plain")
  );
};

export default function ProductsPageNew() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams?.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { addToCart } = useCart();

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Load products from Firebase
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  // Update selected category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    }
  }, [categoryFromUrl]);

  // Helper function to convert price string to number
  const getPrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^0-9.-]+/g, "")) || 0;
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const slug = (p.slug || "").toLowerCase();
        const hasPlain = title.includes("plain") || slug.includes("plain");

        // Handle "Plain Oversized" category - show all plain products
        if (selectedCategory.toLowerCase() === "plain oversized") {
          return hasPlain;
        }

        // Handle "Oversized" category - show all products EXCEPT plain products
        if (selectedCategory.toLowerCase() === "oversized") {
          return !hasPlain;
        }

        // For other categories, match against the category field
        return (
          (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        selectedSizes.some((size) => p.sizes?.includes(size)),
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        selectedColors.some((color) =>
          p.colors?.some((c) => c.hex === color || c.name === color),
        ),
      );
    }

    setFilteredProducts(filtered);
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSizes,
    selectedColors,
    sortBy,
  ]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product: Product): number | null => {
    if (!product?.originalPrice || !product?.price) return null;

    const originalPrice = getPrice(product.originalPrice);
    const currentPrice = getPrice(product.price);

    if (isNaN(originalPrice) || isNaN(currentPrice)) return null;
    if (originalPrice <= currentPrice) return null;

    const discountPercent = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100,
    );
    return discountPercent > 0 ? discountPercent : null;
  };

  // Get unique colors from all products
  const getAvailableColors = (): Array<{ name: string; hex: string }> => {
    const colorMap = new Map<string, string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        if (c.hex && c.name && !colorMap.has(c.hex)) {
          colorMap.set(c.hex, c.name);
        }
      });
    });
    return Array.from(colorMap).map(([hex, name]) => ({ hex, name }));
  };

  return (
    <div className="w-full">
      <Navbar />

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center border border-gray-300 px-3 py-2 rounded mb-3">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 ml-2 outline-none text-sm"
          />
        </div>

        {/* Filter Boxes Grid - Mobile with Inline Expansion */}
        <div className="grid grid-cols-2 gap-2">
          {/* Size Filter Box */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div
              className="p-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleFilter("Size")}
            >
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Size</p>
                <p className="text-xs text-gray-600">
                  {selectedSizes.length > 0
                    ? `${selectedSizes.length} selected`
                    : "Choose"}
                </p>
              </div>
            </div>
            {expandedFilter === "Size" && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 grid grid-cols-3 gap-2">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-2 px-2 border text-xs font-medium transition ${
                      selectedSizes.includes(size)
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Filter Box */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div
              className="p-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleFilter("Colors")}
            >
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Color</p>
                <p className="text-xs text-gray-600">
                  {selectedColors.length > 0
                    ? `${selectedColors.length} selected`
                    : "Choose"}
                </p>
              </div>
            </div>
            {expandedFilter === "Colors" && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 grid grid-cols-4 gap-2">
                {getAvailableColors().map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => toggleColor(color.hex)}
                    className={`py-2 px-2 rounded relative transition text-center ${
                      selectedColors.includes(color.hex)
                        ? "ring-2 ring-offset-1 ring-black"
                        : "border border-gray-300 hover:border-black"
                    }`}
                    title={color.name}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">
                      {color.name.substring(0, 3)}
                    </span>
                    {selectedColors.includes(color.hex) && (
                      <div className="absolute -top-1 -right-1 bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Filter Boxes - Hidden on all screens, only show on mobile via above section */}
      <div className="hidden bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4">
          {/* Size Filter Box */}
          <div
            className="border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition"
            onClick={() => toggleFilter("Size")}
          >
            <p className="text-xs font-semibold text-gray-700 mb-1">Size</p>
            <p className="text-xs text-gray-600">
              {selectedSizes.length > 0
                ? `${selectedSizes.length} selected`
                : "Choose size"}
            </p>
          </div>

          {/* Color Filter Box */}
          <div
            className="border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition"
            onClick={() => toggleFilter("Colors")}
          >
            <p className="text-xs font-semibold text-gray-700 mb-1">Color</p>
            <p className="text-xs text-gray-600">
              {selectedColors.length > 0
                ? `${selectedColors.length} selected`
                : "Choose color"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen bg-white overflow-hidden md:mt-0">
        {/* Sidebar - Hidden on mobile, visible on desktop only */}
        <div
          className={`hidden md:block md:w-56 bg-white border-r border-gray-200 overflow-y-auto z-40 h-screen md:h-auto`}
        >
          <div className="p-3 sm:p-4 md:p-3 h-screen overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
              Filters
            </h3>

            {/* Size Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter("Size")}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Size</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === "Size" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFilter === "Size" && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 px-3 border text-sm font-medium transition ${
                        selectedSizes.includes(size)
                          ? "bg-black text-white border-black"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Colors Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleFilter("Colors")}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Colors</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === "Colors" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedFilter === "Colors" && (
                <div className="mt-3 space-y-3">
                  {getAvailableColors().map((color) => (
                    <div key={color.hex} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleColor(color.hex)}
                        className={`w-8 h-8 rounded-full transition shrink-0 relative ${
                          selectedColors.includes(color.hex)
                            ? "ring-3 ring-offset-2 ring-black"
                            : "border-2 border-gray-300 hover:border-black"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColors.includes(color.hex) && (
                          <svg
                            className="w-5 h-5 text-white absolute inset-0 m-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                      <label className="text-sm cursor-pointer flex-1">
                        {color.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen flex flex-col">
          {/* Top Header */}
          <div className="border-b border-gray-200 bg-white sticky md:top-0 top-0 z-30">
            {/* Desktop Header */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {/* Breadcrumb and Title */}
              <div className="mb-4">
                <p className="text-xs text-gray-600">Home / Products</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  PRODUCTS
                </h2>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 w-full sm:w-auto flex items-center border border-gray-300 px-3 sm:px-4 py-2">
                  <Search size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 ml-2 outline-none text-xs sm:text-sm"
                  />
                </div>

                {/* View and Sort Options */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 border ${
                      viewMode === "grid"
                        ? "border-black bg-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        viewMode === "grid" ? "text-white" : "text-gray-700"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 border ${
                      viewMode === "list"
                        ? "border-black bg-black"
                        : "border-gray-300 hover:border-black"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        viewMode === "list" ? "text-white" : "text-gray-700"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="4" width="18" height="2" />
                      <rect x="3" y="11" width="18" height="2" />
                      <rect x="3" y="18" width="18" height="2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-full">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 text-sm sm:text-base">
                      No products found
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const productSlug = product.id;
                    return (
                      <div
                        key={product.id}
                        className="group cursor-pointer h-full flex flex-col"
                      >
                        <Link href={`/pdtDetails/${productSlug}`}>
                          <div
                            className="aspect-3/4 bg-gray-100 overflow-hidden mb-3 sm:mb-4 relative rounded-lg group"
                            onMouseEnter={() => setHoveredProductId(product.id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                          >
                            <Image
                              src={
                                hoveredProductId === product.id &&
                                product.images &&
                                product.images[1]
                                  ? product.images[1]
                                  : product.image || "/placeholder.png"
                              }
                              alt={product.title || "Product"}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {getDiscountPercentage(product) && (
                              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                SAVE {getDiscountPercentage(product)}%
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 uppercase mb-1 font-semibold tracking-wider">
                            {product.category}
                          </p>
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{product.price || "N/A"}
                            </p>
                            {product.originalPrice &&
                              product.originalPrice !== product.price && (
                                <p className="text-xs line-through text-gray-400">
                                  ₹{product.originalPrice}
                                </p>
                              )}
                          </div>
                        </Link>

                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                product.id &&
                                product.title &&
                                product.price
                              ) {
                                addToCart({
                                  id: product.id,
                                  title: product.title,
                                  price: getPrice(product.price),
                                  image: product.image,
                                  quantity: 1,
                                });
                              }
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-gray-900 bg-white text-gray-900 font-semibold text-xs hover:bg-gray-900 hover:text-white transition-all duration-200"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/pdtDetails/${productSlug}`;
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg border border-gray-900 bg-gray-900 text-white font-semibold text-xs hover:bg-black transition-all duration-200"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-sm sm:text-base">
                      No products found
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const productSlug = product.id;
                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition"
                      >
                        <Link
                          href={`/pdtDetails/${productSlug}`}
                          className="sm:w-32 sm:h-40 shrink-0"
                        >
                          <div
                            className="aspect-square sm:aspect-3/4 w-full h-full bg-gray-100 overflow-hidden rounded-lg relative"
                            onMouseEnter={() => setHoveredProductId(product.id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                          >
                            <Image
                              src={
                                hoveredProductId === product.id &&
                                product.images &&
                                product.images[1]
                                  ? product.images[1]
                                  : product.image || "/placeholder.png"
                              }
                              alt={product.title || "Product"}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {getDiscountPercentage(product) && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                SAVE {getDiscountPercentage(product)}%
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="flex-1 flex flex-col justify-between">
                          <Link href={`/pdtDetails/${productSlug}`}>
                            <p className="text-xs text-gray-600 uppercase mb-1 font-semibold tracking-wider">
                              {product.category}
                            </p>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                              {product.title}
                            </h3>
                            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                              {product.description}
                            </p>
                          </Link>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold text-gray-900">
                                ₹{product.price || "N/A"}
                              </p>
                              {product.originalPrice &&
                                product.originalPrice !== product.price && (
                                  <p className="text-xs line-through text-gray-400">
                                    ₹{product.originalPrice}
                                  </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (
                                    product.id &&
                                    product.title &&
                                    product.price
                                  ) {
                                    addToCart({
                                      id: product.id,
                                      title: product.title,
                                      price: getPrice(product.price),
                                      image: product.image,
                                      quantity: 1,
                                    });
                                  }
                                }}
                                className="py-1.5 px-3 rounded-lg border border-gray-900 bg-white text-gray-900 font-semibold text-xs hover:bg-gray-900 hover:text-white transition-all duration-200"
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = `/pdtDetails/${productSlug}`;
                                }}
                                className="py-1.5 px-3 rounded-lg border border-gray-900 bg-gray-900 text-white font-semibold text-xs hover:bg-black transition-all duration-200"
                              >
                                Buy Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISABLED: Bundle section */}
      {/* <BundleSection /> */}
      <Footer />
    </div>
  );
}
