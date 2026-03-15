'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function EmailPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [productImage, setProductImage] = useState('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%231f2937%22 width=%22100%25%22 height=%22100%25%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2232%22 font-weight=%22bold%22%3ECollided Galaxies%3C/text%3E%3C/svg%3E');
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products from Firestore on mount
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: any[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      
      // Select a random product image
      if (productsData.length > 0) {
        const randomProduct = productsData[Math.floor(Math.random() * productsData.length)];
        const imageUrl = randomProduct.image || randomProduct.images?.[0];
        if (imageUrl) {
          setProductImage(imageUrl);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Show popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has already subscribed in this session
      const hasSubscribed = sessionStorage.getItem('email-popup-subscribed');
      if (!hasSubscribed) {
        setIsOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email', { style: { borderRadius: 0 } });
      return;
    }

    setIsLoading(true);
    try {
      // Add email to Firestore
      await addDoc(collection(db, 'newsletters'), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: 'popup'
      });

      toast.success('Thanks for subscribing!', { style: { borderRadius: 0 } });
      setEmail('');
      sessionStorage.setItem('email-popup-subscribed', 'true');
      setIsOpen(false);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe. Try again.', { style: { borderRadius: 0 } });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('email-popup-subscribed', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 md:p-2.5 bg-white hover:bg-gray-100 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          title="Close"
          aria-label="Close popup"
        >
          <X size={28} className="text-gray-700 hover:text-gray-900" strokeWidth={2.5} />
        </button>

        {/* Image Section */}
        <div 
          className="relative h-56 w-full bg-linear-to-br from-gray-800 to-gray-900 overflow-hidden"
          style={{
            backgroundImage: `url('${productImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent"></div>
        </div>

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
            Stay Updated
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Subscribe to get notified about new drops, exclusive collections, and special offers.
          </p>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder-gray-400 disabled:bg-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Subscribing...
                </>
              ) : (
                'Subscribe Now'
              )}
            </button>
          </form>

          {/* Close Text */}
          <p className="text-center text-xs text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
