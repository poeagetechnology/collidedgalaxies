'use client';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

import Navbar from "../../../src/components/header";
import Footer from "../../../src/components/footer";
import Image from "next/image";
import Link from "next/link";
import { Albert_Sans } from "next/font/google";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot, query, orderBy, where, getDocs } from "firebase/firestore";
import { useCategoryStorage } from "@/src/hooks/useCategoryStorage";

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// ✅ Helper function to generate product URL
function getProductUrl(product: { id: string; slug?: string; title?: string }): string {
  if (product.slug) {
    return `/pdtDetails/${product.slug}`;
  }
  // Fallback: use slugified title + id for products without slug
  const slug = product.title
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '') || 'product';
  return `/products/${slug}-${product.id}`;
}

type Color = {
  name: string;
  hex: string;
};

type Product = {
  id: string;
  slug?: string; // ✅ Added slug
  title?: string;
  image?: string;
  images?: string[];
  discountPriceFirst10Days?: string;
  discountPriceAfter10Days?: string;
  originalPrice?: string;
  category?: string;
  sizes?: string[];
  colors?: Color[] | string[];
  createdAt?: any;
  hasCombos?: boolean; // <-- Add this field
  comboQuantity?: string | number; // <-- Add this field
  comboDiscountPrice?: string | number; // <-- Add this field
};

const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

type ColorOption = {
  name: string;
  code: string;
};

type FilterState = {
  categories: string[];
  sizes: string[];
  colors: string[];
};

function VerticalFilterDropdown({
  show,
  onClose,
  categories,
  selectedFilters,
  setSelectedFilters,
  filterDropdownRef,
  availableColors,
  availableSizes
}: {
  show: boolean;
  onClose: () => void;
  categories: any[];
  selectedFilters: FilterState;
  setSelectedFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filterDropdownRef: React.RefObject<HTMLDivElement | null>;
  availableColors: ColorOption[];
  availableSizes: string[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleExpand = (section: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(expanded === section ? null : section);
  };

  const toggleCategory = (categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName) ? [] : [categoryName]
    }));
  };

  const toggleSize = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleColor = (colorHex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(colorHex)
        ? prev.colors.filter(c => c !== colorHex)
        : [...prev.colors, colorHex]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({ categories: [], sizes: [], colors: [] });
    onClose();
  };

  const hasAnyFilters =
    selectedFilters.categories.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0;

  if (!show) return null;

  return (
    <div
      ref={filterDropdownRef}
      className="absolute left-0 top-full mt-2 z-30"
      style={{ minWidth: 260 }}
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-white border shadow-xl py-2 text-gray-900 w-64">
        {hasAnyFilters && (
          <div className="px-5 pt-2 pb-4 border-b">
            <button
              onClick={clearAllFilters}
              className="text-sm cursor-pointer text-red-600 hover:text-red-800 hover:underline font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        <ul>
          <li
            className="px-5 py-2 text-base cursor-pointer hover:bg-gray-100"
            onClick={(e) => { e.stopPropagation(); clearAllFilters(); }}
          >
            All
          </li>

          <li>
            <div
              className="flex justify-between items-center px-5 py-2 text-base cursor-pointer hover:bg-gray-100"
              onClick={(e) => handleExpand("categories", e)}
            >
              <span>
                Categories {selectedFilters.categories.length > 0 && (
                  <span className="ml-1 text-xs">({selectedFilters.categories.length})</span>
                )}
              </span>
              <Image
                src={expanded === "categories" ? "/upIcon.svg" : "/downIcon.svg"}
                alt="Toggle"
                width={16}
                height={16}
                className="ml-2 inline-block"
              />
            </div>
            {expanded === "categories" && (
              <div className="max-h-48 overflow-y-auto">
                {categories.map((cat: any) => {
                  const isChecked = selectedFilters.categories.includes(cat.name);
                  return (
                    <div
                      key={cat.id || cat.name}
                      className="px-7 py-2 text-base cursor-pointer hover:bg-gray-100 flex items-center"
                      onClick={(e) => toggleCategory(cat.name, e)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleCategory(cat.name, e as any);
                      }}
                    >
                      <input
                        type="radio"
                        checked={isChecked}
                        readOnly
                        className="mr-3 w-4 h-4 cursor-pointer pointer-events-none"
                      />
                      <span>{cat.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </li>

          <li>
            <div
              className="flex justify-between items-center px-5 py-2 text-base cursor-pointer hover:bg-gray-100"
              onClick={(e) => handleExpand("sizes", e)}
            >
              <span>
                Sizes {selectedFilters.sizes.length > 0 && (
                  <span className="ml-1 text-xs">({selectedFilters.sizes.length})</span>
                )}
              </span>
              <Image
                src={expanded === "sizes" ? "/upIcon.svg" : "/downIcon.svg"}
                alt="Toggle"
                width={16}
                height={16}
                className="ml-2 inline-block"
              />
            </div>
            {expanded === "sizes" && (
              <div className="max-h-48 overflow-y-auto">
                {allSizes.map((s) => {
                  const isAvailable = availableSizes.includes(s);
                  const isChecked = selectedFilters.sizes.includes(s);
                  return (
                    <div
                      key={s}
                      className={`px-7 py-2 text-base flex items-center ${isAvailable
                        ? 'cursor-pointer hover:bg-gray-100'
                        : 'cursor-not-allowed opacity-40'
                        }`}
                      onClick={(e) => {
                        if (isAvailable) toggleSize(s, e);
                      }}
                      onTouchEnd={(e) => {
                        if (isAvailable) {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSize(s, e as any);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isAvailable}
                        readOnly
                        className="mr-3 w-4 h-4 cursor-pointer pointer-events-none"
                      />
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </li>

          <li>
            <div
              className="flex justify-between items-center px-5 py-2 text-base cursor-pointer hover:bg-gray-100"
              onClick={(e) => handleExpand("colours", e)}
            >
              <span>
                Colour {selectedFilters.colors.length > 0 && (
                  <span className="ml-1 text-xs">({selectedFilters.colors.length})</span>
                )}
              </span>
              <Image
                src={expanded === "colours" ? "/upIcon.svg" : "/downIcon.svg"}
                alt="Toggle"
                width={16}
                height={16}
                className="ml-2 inline-block"
              />
            </div>
            {expanded === "colours" && (
              <div className="max-h-48 overflow-y-auto">
                {availableColors.length > 0 ? (
                  availableColors.map((clr: ColorOption) => {
                    const isChecked = selectedFilters.colors.includes(clr.code);
                    return (
                      <div
                        key={clr.code}
                        className="flex items-center px-7 py-2 text-base cursor-pointer hover:bg-gray-100"
                        onClick={(e) => toggleColor(clr.code, e)}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleColor(clr.code, e as any);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="mr-3 w-4 h-4 cursor-pointer pointer-events-none"
                        />
                        <span className="w-5 h-5 border mr-3" style={{ background: clr.code, borderColor: "#888" }} />
                        <span>{clr.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-7 py-2 text-sm text-gray-500">
                    No colors available
                  </div>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const { categories } = useCategoryStorage();

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    categories: [],
    sizes: [],
    colors: []
  });
  const [selectedSort, setSelectedSort] = useState<string>('Default');
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  const PRODUCTS_PER_PAGE = 12;

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [productRatings, setProductRatings] = useState<{ [key: string]: { rating: number; count: number } }>({});

  // Add this useEffect to fetch ratings for all products
  useEffect(() => {
    const fetchAllRatings = async () => {
      const ratingsMap: { [key: string]: { rating: number; count: number } } = {};

      for (const product of products) {
        try {
          const q = query(
            collection(db, "reviews"),
            where("productId", "==", product.id)
          );

          const querySnapshot = await getDocs(q);
          const reviews: any[] = [];

          querySnapshot.forEach((doc) => {
            reviews.push(doc.data());
          });

          if (reviews.length > 0) {
            const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const avg = total / reviews.length;
            ratingsMap[product.id] = {
              rating: Number(avg.toFixed(1)),
              count: reviews.length
            };
          }
        } catch (error) {
          console.error(`Error fetching ratings for ${product.id}:`, error);
        }
      }

      setProductRatings(ratingsMap);
    };

    if (products.length > 0) {
      fetchAllRatings();
    }
  }, [products]);

  // Memoize the URL update function
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedFilters.categories.length > 0) {
      params.set('category', selectedFilters.categories[0]);
    }
    if (selectedFilters.sizes.length > 0) {
      params.set('sizes', selectedFilters.sizes.join(','));
    }
    if (selectedFilters.colors.length > 0) {
      params.set('colors', selectedFilters.colors.join(','));
    }
    if (selectedSort !== 'Default') {
      params.set('sort', selectedSort);
    }

    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedFilters, selectedSort, pathname, router]);

  // Update URL when filters or sort change
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Initialize filters and sort from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const sizes = searchParams.get('sizes')?.split(',') || [];
    const colors = searchParams.get('colors')?.split(',') || [];
    const sort = searchParams.get('sort') || 'Default';

    setSelectedFilters({
      categories: category ? [category] : [],
      sizes: sizes,
      colors: colors
    });
    setSelectedSort(sort);

    const savedFilters = sessionStorage.getItem('productFilters');
    const savedSort = sessionStorage.getItem('productSort');

    if (savedFilters && !categoryFromUrl) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters.categories.length > 0 ||
          parsedFilters.sizes.length > 0 ||
          parsedFilters.colors.length > 0) {
          setSelectedFilters(parsedFilters);
        }
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }

    if (savedSort && savedSort !== 'Default') {
      setSelectedSort(savedSort);
    }
  }, [categoryFromUrl, pathname]);

  useEffect(() => {
    sessionStorage.setItem('productFilters', JSON.stringify(selectedFilters));
  }, [selectedFilters]);

  useEffect(() => {
    sessionStorage.setItem('productSort', selectedSort);
  }, [selectedSort]);

  // Reset visible count when filters or search change
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [selectedFilters, selectedSort, searchTerm]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        showFilterDropdown &&
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        showSortDropdown &&
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilterDropdown, showSortDropdown]);

  const getCurrentPrice = (product: Product) => {
    if (!product.createdAt) return product.discountPriceFirst10Days;
    const createdDate = product.createdAt.toDate ? product.createdAt.toDate() : new Date();
    const diffDays = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 10 ? product.discountPriceFirst10Days : product.discountPriceAfter10Days;
  };

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as Product[];
      setProducts(items);
    });
    return () => unsub();
  }, []);

  const normalizeColors = (colors: Color[] | string[] | undefined): ColorOption[] => {
    if (!colors || !Array.isArray(colors)) return [];

    return colors.map(color => {
      if (typeof color === 'object' && 'name' in color && 'hex' in color) {
        return {
          name: color.name,
          code: color.hex
        };
      }
      if (typeof color === 'string') {
        return {
          name: color,
          code: color
        };
      }
      return {
        name: 'Unknown',
        code: '#000000'
      };
    });
  };

  const availableColors: ColorOption[] = Array.from(
    new Map(
      products
        .flatMap(p => normalizeColors(p.colors))
        .map(color => [color.code, color])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const availableSizes = Array.from(
    new Set(
      products
        .flatMap(p => p.sizes || [])
        .filter(Boolean)
    )
  );

  let filteredProducts = products.filter(
    (p) =>
      !searchTerm ||
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedFilters.categories.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      selectedFilters.categories.includes(p.category || '')
    );
  }

  if (selectedFilters.sizes.length > 0) {
    filteredProducts = filteredProducts.filter(p =>
      Array.isArray(p.sizes) &&
      p.sizes.some(size => selectedFilters.sizes.includes(size))
    );
  }

  if (selectedFilters.colors.length > 0) {
    filteredProducts = filteredProducts.filter(p => {
      const productColors = normalizeColors(p.colors);
      return productColors.some(color => selectedFilters.colors.includes(color.code));
    });
  }

  if (selectedSort === "A-Z") {
    filteredProducts = [...filteredProducts].sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", undefined, { sensitivity: "base" })
    );
  } else if (selectedSort === "High to Low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        (Number(getCurrentPrice(b)) || 0) - (Number(getCurrentPrice(a)) || 0)
    );
  } else if (selectedSort === "Low to High") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        (Number(getCurrentPrice(a)) || 0) - (Number(getCurrentPrice(b)) || 0)
    );
  }

  const getFilterDisplayText = () => {
    const hasCategories = selectedFilters.categories.length > 0;
    const hasSizes = selectedFilters.sizes.length > 0;
    const hasColors = selectedFilters.colors.length > 0;

    const activeTypes = [hasCategories, hasSizes, hasColors].filter(Boolean).length;

    if (activeTypes === 0) return 'All';
    if (activeTypes > 1) return 'Custom';
    if (hasCategories) return 'Categories';
    if (hasSizes) return 'Sizes';
    if (hasColors) return 'Colours';

    return 'All';
  };

  const getPageTitle = () => {
    if (selectedFilters.categories.length === 1) {
      return selectedFilters.categories[0];
    }
    return 'Our Products';
  };

  // Helper function to check if product has sizes
  const hasAvailableSizes = (product: Product): boolean => {
    return !!(product.sizes && product.sizes.length > 0);
  };

  const showDescription = selectedFilters.categories.length === 0;
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = filteredProducts.length > visibleCount;

  const handleViewMore = () => {
    setVisibleCount(prev => prev + PRODUCTS_PER_PAGE);
  };

  return (
    <>
      <Navbar />
      <section className={`bg-white min-h-screen ${albertSans.className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 pb-10 md:pt-30 md:pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center w-full pb-10">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight mb-2 md:mb-0">
              {getPageTitle()}
            </h1>
            {showDescription && (
              <p className="text-base md:text-lg text-gray-700 text-center md:w-[250px] md:text-right">
                Shop the latest styles picked just for you.
                Stay ahead of the curve with our newest arrivals.
              </p>
            )}
          </div>

          <div className="w-full flex md:gap-10 sticky top-15 bg-white z-50 py-2 md:static flex-col md:flex-row sm:justify-between sm:items-center">
            <input
              className="border border-gray-400 px-4 py-2 text-base w-full md:w-[400px]"
              placeholder="Search products..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suppressHydrationWarning
            />

            <div className="flex flex-row justify-between md:justify-end md:gap-12 items-center py-4 md:py-0 w-full md:w-auto">
              <div className="relative" ref={filterDropdownRef}>
                <button
                  type="button"
                  className="flex items-center cursor-pointer space-x-2 text-gray-700 text-base hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFilterDropdown((val) => !val);
                    setShowSortDropdown(false);
                  }}
                  suppressHydrationWarning
                >
                  <Image
                    src="/filterIcon.svg"
                    alt="Filter"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span>
                    Filter by <span className="font-semibold">{getFilterDisplayText()}</span>
                  </span>
                </button>
                <VerticalFilterDropdown
                  show={showFilterDropdown}
                  onClose={() => setShowFilterDropdown(false)}
                  categories={categories}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  filterDropdownRef={filterDropdownRef}
                  availableColors={availableColors}
                  availableSizes={availableSizes}
                />
              </div>

              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  className="flex items-center cursor-pointer space-x-2 text-gray-700 text-base hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSortDropdown(val => !val);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Image
                    src="/sortIcon.svg"
                    alt="Sort"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span>
                    Sort by <span className="font-semibold">{selectedSort}</span>
                  </span>
                </button>
                {showSortDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white shadow-lg border z-30"
                    ref={sortDropdownRef}
                    onClick={e => e.stopPropagation()}
                  >
                    <ul>
                      <li
                        onClick={() => { setSelectedSort('Default'); setShowSortDropdown(false); }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        Default
                      </li>
                      <li
                        onClick={() => { setSelectedSort('A-Z'); setShowSortDropdown(false); }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        A-Z
                      </li>
                      <li
                        onClick={() => { setSelectedSort('High to Low'); setShowSortDropdown(false); }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        High to Low
                      </li>
                      <li
                        onClick={() => { setSelectedSort('Low to High'); setShowSortDropdown(false); }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        Low to High
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Products Grid with animations */}
          <motion.div 
            className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10"
            initial="hidden"
            whileInView="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
            viewport={{ once: false, margin: "-50px" }}
          >
            {visibleProducts.map((product) => {
              const currentPrice = getCurrentPrice(product);
              const isOutOfStock = !hasAvailableSizes(product);
              const displayImage = product.image || (product.images && product.images[0]) || '/placeholder.png';
              const productUrl = getProductUrl(product); // ✅ Generate slug-based URL

              return (
                <motion.div 
                  key={product.id} 
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: false, margin: "-50px" }}
                >
                  <Link href={productUrl} className="group">
                    <motion.div
                      className={`aspect-[3/4] relative w-full overflow-hidden bg-gray-100 
    ${!loadedImages[product.id] ? 'pointer-events-none' : ''}`}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Out of Stock Tag - highest priority */}
                      {isOutOfStock && (
                        <motion.span 
                          className="absolute top-2 left-2 bg-red-600 text-white font-semibold px-3 py-1 text-xs shadow-sm z-10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          OUT OF STOCK
                        </motion.span>
                      )}

                      {/* Combo Tag - only show if in stock */}
                      {!isOutOfStock && product.hasCombos && !!product.comboQuantity && !!product.comboDiscountPrice && (
                        <motion.span 
                          className="absolute top-2 left-2 bg-green-100 text-green-800 font-semibold px-3 py-1 text-xs shadow-sm z-10"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          BUY {product.comboQuantity} @{product.comboDiscountPrice}
                        </motion.span>
                      )}

                      {/* Rating Badge - show if product has ratings */}
                      {!isOutOfStock && productRatings[product.id] && (
                        <motion.div 
                          className="absolute bottom-2 left-2 bg-white text-black font-semibold px-3 py-1 text-xs shadow-sm z-10 flex items-center gap-1"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          viewport={{ once: false, margin: "-50px" }}
                        >
                          <Image
                            src="/starIcon.svg"
                            alt="star"
                            width={12}
                            height={12}
                            className="w-4 h-4"
                          />
                          <span>{productRatings[product.id].rating}</span>
                          <span className="text-green-700">({productRatings[product.id].count})</span>
                        </motion.div>
                      )}

                      <Image
                        src={displayImage}
                        alt={product.title || 'Product'}
                        fill
                        className={`object-cover object-center transition-transform duration-300 ease-in-out 
      ${loadedImages[product.id] ? 'group-hover:scale-105' : ''} ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onLoad={() =>
                          setLoadedImages((prev) => ({ ...prev, [product.id]: true }))
                        }
                      />
                    </motion.div>
                  </Link>
                  <motion.div 
                    className="flex items-end justify-between mt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    viewport={{ once: false, margin: "-50px" }}
                  >
                    <div className="flex flex-col">
                      <p className="uppercase text-xs mb-2">{product.category}</p>
                      <h3 className="text-xl text-gray-900">{product.title}</h3>
                      {product.originalPrice ? (
                        <p className="text-xl font-semibold text-gray-700 mt-1">
                          ₹{currentPrice}{" "}
                          <span className="line-through text-red-500 ml-2 text-base font-normal">₹{product.originalPrice}</span>
                        </p>
                      ) : (
                        <p className="text-xl font-semibold text-gray-700 mt-1">₹{currentPrice}</p>
                      )}
                    </div>
                    <Link href={productUrl}>
                      <motion.button 
                        className={`p-4 cursor-pointer active:scale-95
                         ${isOutOfStock
                          ? 'bg-gray-400 cursor-not-allowed opacity-50'
                          : 'bg-black hover:bg-gray-900'
                        }
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Image src="/inclinedArrow.svg" alt="arrow icon" width={14} height={14} />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {filteredProducts.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-lg text-gray-600">No products found matching your filters.</p>
            </motion.div>
          )}

          {hasMoreProducts && (
            <motion.div 
              className="flex justify-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.button
                onClick={handleViewMore}
                className="bg-black text-white text-base px-8 py-3 cursor-pointer hover:bg-gray-900 transition-all duration-200 active:scale-95"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View More
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsPageContent />
    </Suspense>
  );
}