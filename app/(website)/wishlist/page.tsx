'use client';

import { useEffect, useState } from 'react';
import { useAuth, db } from '@/src/context/authProvider';
import Navbar from '@/src/components/header';
import Footer from '@/src/components/footer';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface WishlistProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
}

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch wishlist items
  useEffect(() => {
    if (!loading && !user) {
      setIsLoading(false);
      return;
    }

    if (user) {
      const fetchWishlist = async () => {
        try {
          setIsLoading(true);
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const wishlist = userDoc.data().wishlist || [];
            setWishlistIds(wishlist);

            // Fetch product details for each wishlist item
            if (wishlist.length > 0) {
              const productsRef = collection(db, 'products');
              const productsSnapshot = await getDocs(productsRef);
              
              const items: WishlistProduct[] = [];
              productsSnapshot.forEach((doc) => {
                if (wishlist.includes(doc.id)) {
                  const price = typeof doc.data().price === 'string' 
                    ? parseFloat(doc.data().price) 
                    : (doc.data().price || 0);
                  
                  items.push({
                    id: doc.id,
                    title: doc.data().title || 'Untitled',
                    price: price,
                    image: doc.data().image || doc.data().images?.[0] || '/placeholder.png',
                    slug: doc.data().slug || doc.id,
                  });
                }
              });

              setWishlistItems(items);
            }
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          toast.error('Failed to load wishlist', { style: { borderRadius: 0 } });
        } finally {
          setIsLoading(false);
        }
      };

      fetchWishlist();
    }
  }, [user, loading]);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const userRef = doc(db, 'users', user!.uid);
      const updatedWishlist = wishlistIds.filter(id => id !== productId);
      
      await updateDoc(userRef, {
        wishlist: updatedWishlist
      });

      setWishlistIds(updatedWishlist);
      setWishlistItems(wishlistItems.filter(item => item.id !== productId));
      toast.success('Removed from wishlist', { style: { borderRadius: 0 } });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item', { style: { borderRadius: 0 } });
    }
  };

  if (loading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-24 pb-10">
            <div className="text-center py-16">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <h1 className="text-4xl font-bold mb-4">Your Wishlist</h1>
              <p className="text-gray-600 mb-8">Sign in to view your saved items</p>
              <Link 
                href="/signin" 
                className="inline-block bg-black text-white px-8 py-3 hover:bg-gray-900 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-24 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Heart size={40} className="text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-8">Start adding items you love!</p>
                <Link 
                  href="/products"
                  className="inline-block bg-black text-white px-8 py-3 hover:bg-gray-900 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 bg-gray-200 overflow-hidden group">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                        title="Remove from wishlist"
                      >
                        <Heart size={20} className="text-red-500 fill-red-500" />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-black">
                          ₹{typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/pdtDetails/${item.slug}`}
                          className="flex-1 bg-black text-white py-2.5 rounded hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                        >
                          View
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
