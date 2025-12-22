'use client';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Albert_Sans, Inria_Serif } from 'next/font/google';
import { db } from '@/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { ChevronDown, ChevronLeft, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import Navbar from '../../../src/components/header';
import Footer from '../../../src/components/footer';

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const inriaSerif = Inria_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
});

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
  hasCombos?: boolean;
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
  const [expandedFilter, setExpandedFilter] = useState<string | null>('Size');
  const [sortBy, setSortBy] = useState<string>('newest');

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
        // Already sorted by createdAt desc from Firebase
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
    <div className={albertSans.className}>
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      <div className="flex min-h-screen bg-white overflow-hidden -mt-14 md:mt-0">
        {/* Sidebar */}
        <div
          className={`fixed md:static inset-y-0 left-0 w-full max-w-xs sm:max-w-sm md:max-w-md bg-white border-r border-gray-200 transform transition-transform duration-300 z-40 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
        <div className="p-3 sm:p-4 md:p-6 h-screen overflow-y-auto">
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-4 right-4 z-50"
            >
              <X size={24} />
            </button>

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
            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu size={22} />
              </button>
              <Link href="/" className={`text-lg sm:text-xl tracking-wide text-gray-900 ${inriaSerif.className}`}>COGA</Link>
              <div className="flex gap-2 sm:gap-3">
                <button>
                  <Search size={18} />
                </button>
                <button>
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>

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
                  <Search size={18} className="text-gray-400 flex-shrink-0" />
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

            {/* Mobile Search Bar */}
            <div className="flex md:hidden px-2 sm:px-4 py-2 sm:py-3 gap-2">
              <div className="flex-1 flex items-center border border-gray-300 px-2 sm:px-3 py-2">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 ml-2 outline-none text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Mobile Sort and View Options */}
            <div className="flex md:hidden items-center justify-between px-4 py-3 gap-2 text-xs overflow-x-auto">
              <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded whitespace-nowrap">
                <span>SKU</span>
                <ChevronDown size={14} />
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs appearance-none cursor-pointer bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price Low</option>
                <option value="price-high">Price High</option>
              </select>
              <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded whitespace-nowrap">
                <span>COLLECTIONS</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded whitespace-nowrap">
                <span>SHIRTS</span>
                <ChevronDown size={14} />
              </button>
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
                    <Link key={product.id} href={`/pdtDetails/${productSlug}`}>
                      <div className="group cursor-pointer h-full">
                        <div className="aspect-square bg-gray-100 overflow-hidden mb-2 sm:mb-3 relative">
                          <Image
                            src={product.image || '/placeholder.png'}
                            alt={product.title || 'Product'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
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
                      </div>
                    </div>
                    </Link>
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
