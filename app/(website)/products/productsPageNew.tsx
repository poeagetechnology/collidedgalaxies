'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ChevronDown, ChevronLeft, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import Navbar from '../../../src/components/header';
import Footer from '../../../src/components/footer';

type Product = {
  id: string;
  title?: string;
  slug?: string;
  image?: string;
  images?: string[];
  price?: string;
  originalPrice?: string;
  discountedPrice?: string;
  priceFirst10Days?: string;
  priceAfter10Days?: string;
  category?: string;
  sizes?: string[];
  colors?: Array<{ name: string; hex: string }>;
  description?: string;
  createdAt?: any;
  sizeChart?: string;
};

export default function ProductsPageNew() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const allTags = ['Trending', 'New', 'Sale', 'Premium', 'Comfortable', 'Eco-friendly'];

  // Load products from Firebase
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  // Helper function to convert price string to number
  const getPrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^0-9.-]+/g, '')) || 0;
  };

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        selectedSizes.some((size) => p.sizes?.includes(size))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        selectedColors.some((color) => 
          p.colors?.some((c) => c.hex === color || c.name === color)
        )
      );
    }

    // Price range filter
    filtered = filtered.filter((p) => {
      const price = getPrice(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => getPrice(a.price) - getPrice(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => getPrice(b.price) - getPrice(a.price));
        break;
      case 'newest':
      default:
        // Sort by plain vs non-plain first, then by createdAt
        filtered.sort((a, b) => {
          const aIsPlain = (a.title || "").toLowerCase().includes("plain") ||
                          (a.slug || "").toLowerCase().includes("plain");
          const bIsPlain = (b.title || "").toLowerCase().includes("plain") ||
                          (b.slug || "").toLowerCase().includes("plain");
          
          // Plain products come last
          if (aIsPlain && !bIsPlain) return 1;
          if (!aIsPlain && bIsPlain) return -1;
          
          // Both same type - sort by createdAt (newest first)
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedSizes, selectedColors, priceRange, sortBy, selectedTags, minRating]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product: Product): number | null => {
    if (!product?.originalPrice || !product?.price) return null;
    
    const originalPrice = Number(product.originalPrice);
    const currentPrice = Number(product.price);
    
    if (isNaN(originalPrice) || isNaN(currentPrice)) return null;
    if (originalPrice <= currentPrice) return null;
    
    const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
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
              onClick={() => toggleFilter('Size')}>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Size</p>
                <p className="text-xs text-gray-600">
                  {selectedSizes.length > 0 ? `${selectedSizes.length} selected` : 'Choose'}
                </p>
              </div>
            </div>
            {expandedFilter === 'Size' && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 grid grid-cols-3 gap-2">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`py-2 px-2 border text-xs font-medium transition ${
                      selectedSizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
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
              onClick={() => toggleFilter('Colors')}>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Color</p>
                <p className="text-xs text-gray-600">
                  {selectedColors.length > 0 ? `${selectedColors.length} selected` : 'Choose'}
                </p>
              </div>
            </div>
            {expandedFilter === 'Colors' && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 grid grid-cols-4 gap-2">
                {getAvailableColors().map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => toggleColor(color.hex)}
                    className={`py-2 px-2 border text-xs font-medium transition text-center ${
                      selectedColors.includes(color.hex)
                        ? 'bg-black text-white border-black'
                        : 'border-gray-300 hover:border-black'
                    }`}
                    title={color.name}
                  >
                    <div 
                      className="w-4 h-4 rounded-full mx-auto mb-1" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs">{color.name.substring(0, 3)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Price Filter Box */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div 
              className="p-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleFilter('Price')}>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Price</p>
                <p className="text-xs text-gray-600">₹{priceRange[0]} - ₹{priceRange[1]}</p>
              </div>
            </div>
            {expandedFilter === 'Price' && (
              <div className="bg-gray-50 border-t border-gray-200 p-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Min: ₹{priceRange[0]}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Max: ₹{priceRange[1]}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Availability Filter Box */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div 
              className="p-3 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleFilter('Availability')}>
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Availability</p>
                <p className="text-xs text-gray-600">In Stock</p>
              </div>
            </div>
            {expandedFilter === 'Availability' && (
              <div className="bg-gray-50 border-t border-gray-200 p-3">
                <p className="text-xs text-gray-600">Only showing products in stock</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 10000 || selectedTags.length > 0) && (
          <button 
            onClick={() => {
              setSelectedSizes([]);
              setSelectedColors([]);
              setPriceRange([0, 10000]);
              setSelectedTags([]);
              setMinRating(0);
            }}
            className="w-full mt-3 py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition"
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Desktop Filter Boxes - Hidden on all screens, only show on mobile via above section */}
      <div className="hidden bg-white border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
          {/* Size Filter Box */}
          <div className="border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition"
            onClick={() => toggleFilter('Size')}>
            <p className="text-xs font-semibold text-gray-700 mb-1">Size</p>
            <p className="text-xs text-gray-600">
              {selectedSizes.length > 0 ? `${selectedSizes.length} selected` : 'Choose size'}
            </p>
          </div>
          
          {/* Color Filter Box */}
          <div className="border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition"
            onClick={() => toggleFilter('Colors')}>
            <p className="text-xs font-semibold text-gray-700 mb-1">Color</p>
            <p className="text-xs text-gray-600">
              {selectedColors.length > 0 ? `${selectedColors.length} selected` : 'Choose color'}
            </p>
          </div>
          
          {/* Price Filter Box */}
          <div className="border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition"
            onClick={() => toggleFilter('Price')}>
            <p className="text-xs font-semibold text-gray-700 mb-1">Price</p>
            <p className="text-xs text-gray-600">₹{priceRange[0]} - ₹{priceRange[1]}</p>
          </div>
          
          {/* Availability Filter Box */}
          <div className="border border-gray-300 rounded p-3 cursor-pointer hover:border-black transition"
            onClick={() => toggleFilter('Availability')}>
            <p className="text-xs font-semibold text-gray-700 mb-1">Availability</p>
            <p className="text-xs text-gray-600">In Stock</p>
          </div>
        </div>
      </div>
      
      <div className="flex min-h-screen bg-white overflow-hidden md:mt-0">
        {/* Sidebar - Hidden on mobile, visible on desktop only */}
        <div
          className={`hidden md:block md:w-56 bg-white border-r border-gray-200 overflow-y-auto z-40 h-screen md:h-auto`}
        >
        <div className="p-3 sm:p-4 md:p-3 h-screen overflow-y-auto">

            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Filters</h3>

            {/* Size Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter('Size')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Size</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'Size' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'Size' && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 px-3 border text-sm font-medium transition ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Availability Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter('Availability')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Availability</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'Availability' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'Availability' && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">In Stock (544)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Out Of Stock (48)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Colors Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter('Colors')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Colors</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'Colors' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'Colors' && (
                <div className="mt-3 space-y-3">
                  {getAvailableColors().map((color) => (
                    <div key={color.hex} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleColor(color.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          selectedColors.includes(color.hex)
                            ? 'border-black'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <label className="text-sm cursor-pointer flex-1">
                        {color.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter('PriceRange')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Price Range</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'PriceRange' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'PriceRange' && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      placeholder="Min"
                      className="w-full px-2 py-2 border border-gray-300 text-sm"
                    />
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      placeholder="Max"
                      className="w-full px-2 py-2 border border-gray-300 text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                  </div>
                </div>
              )}
            </div>

            {/* Collections Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter('Collections')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Collections</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'Collections' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'Collections' && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">Collections coming soon</p>
                </div>
              )}
            </div>

            {/* Tags Filter */}
            <div className="mb-6 border-b pb-4">
              <button
                onClick={() => toggleFilter('Tags')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Tags</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'Tags' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'Tags' && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Tags coming soon</p>
                </div>
              )}
            </div>

            {/* Ratings Filter */}
            <div className="mb-6">
              <button
                onClick={() => toggleFilter('Ratings')}
                className="w-full flex justify-between items-center py-2 font-medium hover:text-gray-600"
              >
                <span>Ratings</span>
                <ChevronDown
                  size={18}
                  className={`transform transition-transform ${
                    expandedFilter === 'Ratings' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFilter === 'Ratings' && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">Ratings coming soon</p>
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
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">PRODUCTS</h2>
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
                  <button className="p-2 border border-gray-300 hover:border-black">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button className="p-2 border border-gray-300 hover:border-black">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-sm sm:text-base">No products found</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  // Create slug: just use ID as the slug (simplest and most reliable)
                  const productSlug = product.id;
                  return (
                    <div key={product.id} className="group cursor-pointer h-full flex flex-col">
                      <Link href={`/pdtDetails/${productSlug}`}>
                        <div 
                          className="aspect-square bg-gray-100 overflow-hidden mb-2 sm:mb-3 relative"
                          onMouseEnter={() => setHoveredProductId(product.id)}
                          onMouseLeave={() => setHoveredProductId(null)}
                        >
                          <Image
                            src={hoveredProductId === product.id && product.images && product.images[1] ? product.images[1] : (product.image || '/placeholder.png')}
                            alt={product.title || 'Product'}
                            fill
                            className="object-cover transition-transform duration-300"
                          />
                        </div>
                        
                        <p className="text-xs text-gray-600 uppercase mb-0.5 line-clamp-1">{product.category}</p>
                        <h3 className="font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-xs sm:text-sm">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <p className="text-sm sm:text-lg font-semibold text-gray-900">
                            ₹{product.price || 'N/A'}
                          </p>
                          {product.originalPrice && product.originalPrice !== product.price && (
                          <p className="text-xs line-through text-gray-500">
                            ₹{product.originalPrice}
                          </p>
                        )}
                          {getDiscountPercentage(product) && (
                            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                              SAVE {getDiscountPercentage(product)}%
                            </div>
                          )}
                      </div>
                      </Link>
                      {/* Shiprocket Checkout Button */}
                      <Link href={`/pdtDetails/${product.id}?checkout=shiprocket`}>
                        <button
                          className="mt-2 sm:mt-3 w-full bg-blue-600 text-white py-2 sm:py-2.5 text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors rounded"
                        >
                          Ship with Shiprocket
                        </button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
