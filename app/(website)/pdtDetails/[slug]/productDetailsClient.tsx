'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useCart } from '@/src/context/CartContext';
import { useAuth } from "@/src/context/authProvider";
import SignIn from "../../../../src/components/forms/signin";
import Navbar from "../../../../src/components/header";
import Footer from "../../../../src/components/footer";
import { ChevronLeft, ChevronRight, Heart, Menu, X, Plus, Minus, Zap, Share2 } from "lucide-react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import RelatedProducts from "@/src/components/relatedProducts";
import toast from "react-hot-toast";
import { createShiprocketOrder, ShiprocketCustomer } from '@/src/utils/shiprocket-order.utils';

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='800'%20height='800'%3E%3Crect%20fill='%23f3f4f6'%20width='100%25'%20height='100%25'/%3E%3Ctext%20x='50%25'%20y='50%25'%20dominant-baseline='middle'%20text-anchor='middle'%20fill='%23999'%20font-size='24'%3ENo%20image%3C/text%3E%3C/svg%3E";

interface ProductDetailsClientProps {
  initialProduct: any;
  slug: string;
}

export default function ProductDetailsClient({ initialProduct, slug }: ProductDetailsClientProps) {
  const [product] = useState(initialProduct);

  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [isDirectBuying, setIsDirectBuying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle scroll detection for sticky button
  useEffect(() => {
    const handleScroll = () => {
      // Check if scrolled past initial threshold (100px)
      const hasScrolledPast = window.scrollY > 100;
      
      // Check if footer is visible (approaching footer)
      let isNearFooter = false;
      if (footerRef.current) {
        const footerPosition = footerRef.current.getBoundingClientRect().top;
        // Hide button if footer is within 200px from bottom of viewport
        isNearFooter = footerPosition < 200;
      }
      
      // Show button only if scrolled past threshold AND not near footer
      setHasScrolled(hasScrolledPast && !isNearFooter);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize selected size and color
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      const firstColor = product.colors[0];
      setSelectedColor(typeof firstColor === 'string' ? firstColor : firstColor.hex);
    }
  }, [product?.sizes, product?.colors]);

  // Helper function to check if product has sizes and out-of-stock flag
  const hasAvailableSizes = (p: any): boolean => {
    return !!(p?.sizes && p.sizes.length > 0);
  };
  const isOutOfStock = !hasAvailableSizes(product);

  // Calculate discount percentage
  const getDiscountPercentage = (): number | null => {
    if (!product) return null;
    
    // Prioritize originalPrice if available
    if (product?.originalPrice && product?.price) {
      const originalPrice = Number(product.originalPrice);
      const currentPrice = Number(product.price);
      
      if (!isNaN(originalPrice) && !isNaN(currentPrice) && originalPrice > currentPrice) {
        const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        return discountPercent > 0 ? discountPercent : null;
      }
    }
    
    // Check for discountPriceFirst10Days compared to regular price
    if (product?.discountPriceFirst10Days && product?.price) {
      const currentPrice = Number(product.price);
      const discountPrice = Number(product.discountPriceFirst10Days);
      
      if (!isNaN(currentPrice) && !isNaN(discountPrice) && currentPrice > discountPrice) {
        const discountPercent = Math.round(((currentPrice - discountPrice) / currentPrice) * 100);
        return discountPercent > 0 ? discountPercent : null;
      }
    }
    
    return null;
  };

  const discountPercentage = getDiscountPercentage();


  const handleCloseSizeChart = () => {
    // Size chart functionality to be added later
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // Load wishlist status from Firestore
  useEffect(() => {
    if (user && product?.id) {
      const loadWishlistStatus = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const wishlist = userDoc.data().wishlist || [];
            setIsWishlisted(wishlist.includes(product.id));
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      };
      loadWishlistStatus();
    }
  }, [user, product?.id]);

  // Handle wishlist toggle
  const handleToggleWishlist = async () => {
    if (!user) {
      setIsSignInOpen(true);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document with wishlist
        await updateDoc(userRef, {
          wishlist: [product.id]
        });
        setIsWishlisted(true);
        toast.success('Added to wishlist!', { style: { borderRadius: 0 } });
      } else {
        const wishlist = userDoc.data().wishlist || [];
        
        if (wishlist.includes(product.id)) {
          // Remove from wishlist
          const updatedWishlist = wishlist.filter((id: string) => id !== product.id);
          await updateDoc(userRef, { wishlist: updatedWishlist });
          setIsWishlisted(false);
          toast.success('Removed from wishlist', { style: { borderRadius: 0 } });
        } else {
          // Add to wishlist
          const updatedWishlist = [...wishlist, product.id];
          await updateDoc(userRef, { wishlist: updatedWishlist });
          setIsWishlisted(true);
          toast.success('Added to wishlist!', { style: { borderRadius: 0 } });
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist', { style: { borderRadius: 0 } });
    }
  };

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: product?.title || 'Check out this product',
      text: product?.description || product?.title,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      // Try using Web Share API if available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Product link copied to clipboard!', { style: { borderRadius: 0 } });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share', { style: { borderRadius: 0 } });
      }
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      setIsSignInOpen(true);
      return;
    }

    if (!product || !selectedSize || !selectedColor) {
      alert("Please select size and color");
      return;
    }

    const selectedColorObj =
      product?.colors?.find((c: any) =>
        typeof c === 'string'
          ? c === selectedColor
          : c.hex === selectedColor
      ) ||
      (product?.colors?.[0]
        ? (typeof product.colors[0] === 'string'
          ? { name: product.colors[0], hex: product.colors[0] }
          : product.colors[0])
        : { name: 'Default', hex: '#ECE9E6' });

    setIsAddingToCart(true);

    setTimeout(() => {
      addToCart(
        {
          id: product.id,
          productId: product.id,
          title: product.title || 'Untitled Product',
          price: product.price ?? product.discountPriceFirst10Days ?? 0,
          image: product.image || product.images?.[0] || PLACEHOLDER_IMG,
        },
        quantity,
        selectedSize,
        selectedColorObj
      );

      setIsCartOpen(true);
      setIsAddingToCart(false);
    }, 500);
  };



  const handleDirectBuy = async () => {
    if (!user) {
      setIsSignInOpen(true);
      return;
    }

    if (!product || !selectedSize || !selectedColor) {
      alert("Please select size and color");
      return;
    }

    const selectedColorObj =
      product?.colors?.find((c: any) =>
        typeof c === 'string'
          ? c === selectedColor
          : c.hex === selectedColor
      ) ||
      (product?.colors?.[0]
        ? (typeof product.colors[0] === 'string'
          ? { name: product.colors[0], hex: product.colors[0] }
          : product.colors[0])
        : { name: 'Default', hex: '#ECE9E6' });

    setIsDirectBuying(true);

    try {
      const directBuyData = {
        userId: user.uid,
        productId: product.id,
        productTitle: product.title,
        price: product.price ?? product.discountPriceFirst10Days ?? 0,
        quantity,
        size: selectedSize,
        color: selectedColorObj,
        userEmail: user.email,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      console.log('🛒 [Direct Buy] Redirecting to checkout with product:', directBuyData);

      // Store direct buy data in session storage for checkout page to use
      sessionStorage.setItem('directBuyData', JSON.stringify(directBuyData));

      // Redirect directly to checkout page
      window.location.href = `/checkout?isDirectBuy=true`;
    } catch (error) {
      console.error('❌ [Direct Buy] Error:', error);
      alert('Failed to process direct buy. Please try again.');
      setIsDirectBuying(false);
    }
  };

  const handleShiprocketCheckout = async () => {
    if (!product || !selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    if (!user) {
      setIsSignInOpen(true);
      return;
    }

    setIsDirectBuying(true);

    try {
      // Prepare customer data from Firebase
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};

      // Get default address or use provided data
      const defaultAddress = userData.addresses?.[0] || {};

      const customer: ShiprocketCustomer = {
        name: userData.fullName || user.displayName || 'Customer',
        email: user.email || '',
        phone: userData.phone || '9999999999',
        address: defaultAddress.address || 'Address not set',
        city: defaultAddress.city || 'City',
        state: defaultAddress.state || 'State',
        pincode: defaultAddress.pincode || '000000',
        country: 'India'
      };

      // Create order on Shiprocket
      const result = await createShiprocketOrder(
        {
          id: product.id,
          name: product.title,
          price: product.price ?? product.discountPriceFirst10Days ?? 0,
          quantity: quantity
        },
        customer,
        'Default'
      );

      // Redirect to success page
      window.location.href = `/success?order_id=${result.order_id}&payment_gateway=shiprocket`;
    } catch (error) {
      console.error('Shiprocket order error:', error);
      toast.error('Failed to create order');
    } finally {
      setIsDirectBuying(false);
    }
  };

  if (!product) {
    return null;
  }

  const images = product?.images && product.images.length > 0 ? product.images : (product?.image ? [product.image] : [PLACEHOLDER_IMG]);

  return (
    <>
      <Navbar />
      <div className="bg-white min-h-screen">
        {/* Desktop Header Navigation */}
        <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <Link href="/products" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full transition-colors ${isWishlisted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Share this product"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Header Navigation */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-40">
          <Link href="/products" className="flex items-center text-gray-600">
            <ChevronLeft size={24} />
          </Link>
          <h2 className="flex-1 text-center text-sm font-semibold line-clamp-1 px-4">{product?.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full transition-colors ${isWishlisted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Share this product"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-4 md:p-8 max-w-6xl mx-auto">
          {/* Desktop: Image Gallery Section */}
          <div className="hidden md:block">
            {/* Main Image */}
            <div className="relative w-full h-125 bg-gray-100 overflow-hidden mb-4">
              <Image
                src={images[selectedImageIndex] || PLACEHOLDER_IMG}
                alt={product?.title || 'Product'}
                fill
                priority
                className="object-cover"
              />
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-full h-24 bg-gray-100 overflow-hidden cursor-pointer transition-all ${
                    selectedImageIndex === idx ? 'ring-2 ring-black' : 'hover:opacity-70'
                  }`}
                >
                  <Image
                    src={img || PLACEHOLDER_IMG}
                    alt={`thumb-${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: Image Carousel */}
          <div className="md:hidden relative">
            {/* Image Carousel */}
            <div className="relative w-full h-96 bg-gray-100 overflow-hidden mb-4 rounded-lg">
              <Image
                src={images[selectedImageIndex] || PLACEHOLDER_IMG}
                alt={product?.title || 'Product'}
                fill
                priority
                className="object-cover"
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === selectedImageIndex ? 'bg-black w-6' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="flex flex-col">
            {/* Product Info */}
            <div className="mb-6">
              {isOutOfStock && (
                <div className="mb-3 inline-block bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
                  OUT OF STOCK
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product?.title}</h1>

              {/* Price with Discount Badge */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="text-2xl font-semibold">₹{product?.price ?? product?.discountPriceFirst10Days ?? '—'}</div>
                {product?.originalPrice && product?.originalPrice !== product?.price && (
                  <p className="text-lg line-through text-gray-500">₹{product.originalPrice}</p>
                )}
                {discountPercentage && (
                  <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-base leading-relaxed">
                {product?.description ?? "No description available."}
              </p>

              {/* Country of Production */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Country of Production:</span>
                <span className="text-sm text-gray-600">India</span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">Size</label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                  const available = product?.sizes ? product.sizes.includes(size) : true;
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={`py-3 text-sm font-medium border-2 transition-all ${
                        selectedSize === size && available
                          ? 'bg-black text-white border-black'
                          : available
                          ? 'border-gray-300 text-gray-900 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Add to Cart - Desktop */}
            <div className="hidden md:flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-3 py-2 hover:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock}
                    className="px-3 py-2 hover:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart || !selectedSize || !selectedColor}
                  className="flex-1 bg-black text-white py-3 font-semibold hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isOutOfStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'ADD TO CART'}
                </button>
                <button
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock || isDirectBuying || !selectedSize || !selectedColor}
                  className="flex-1 bg-orange-500 text-white py-3 font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  {isOutOfStock ? 'Out of Stock' : isDirectBuying ? 'Processing...' : 'BUY NOW'}
                </button>
              </div>
              {/* Shiprocket Button */}
              <button
                onClick={handleShiprocketCheckout}
                disabled={isOutOfStock || !selectedSize || !selectedColor}
                className="w-full bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isOutOfStock ? 'Out of Stock' : 'SHIP WITH SHIPROCKET'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Fixed Bottom CTA */}
        {hasScrolled && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 safe-area-inset-bottom z-50 animate-slide-in-up">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Quantity Controls for Mobile */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-1.5 py-1 hover:bg-gray-200 rounded disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2.5 py-1 font-medium text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock}
                    className="px-1.5 py-1 hover:bg-gray-200 rounded disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart || !selectedSize || !selectedColor}
                  className="flex-1 bg-black text-white py-2.5 text-sm font-semibold rounded-lg hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isOutOfStock ? 'Out' : isAddingToCart ? 'Adding...' : 'ADD'}
                </button>
                {/* Buy Now Button */}
                <button
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock || isDirectBuying || !selectedSize || !selectedColor}
                  className="flex-1 bg-orange-500 text-white py-2.5 text-sm font-semibold rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                >
                  <Zap size={14} />
                  {isOutOfStock ? 'Out' : isDirectBuying ? 'Wait...' : 'BUY'}
                </button>
              </div>
              {/* Shiprocket Button */}
              <button
                onClick={handleShiprocketCheckout}
                disabled={isOutOfStock || !selectedSize || !selectedColor}
                className="w-full bg-blue-600 text-white py-2.5 text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isOutOfStock ? 'Out' : 'SHIPROCKET'}
              </button>
            </div>
          </div>
        )}

        {/* SignIn Modal */}
        <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />

        {/* Related Products Section */}
        <RelatedProducts 
          currentProductId={product.id} 
          currentCategory={product.category}
        />
        <div ref={footerRef}>
          <Footer />
        </div>
      </div>
    </>
  );
}
