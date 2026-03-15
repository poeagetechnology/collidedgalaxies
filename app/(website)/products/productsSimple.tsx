'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../../src/components/header';
import Footer from '../../../src/components/footer';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  title?: string;
  slug?: string;
  image?: string;
  images?: string[];
  price?: string;
  category?: string;
};

export default function SimpleProductsPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all products
  useEffect(() => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data: Product[] = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as any) } as Product);
          });
          console.log(`✅ Loaded ${data.length} products`);
          console.log('📂 Categories:', [...new Set(data.map(p => p.category))]);
          setProducts(data);
          setLoading(false);
        },
        (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          console.error('❌ Error:', message);
          setError(message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setLoading(false);
    }
  }, []);

  // Filter products when category or products change
  useEffect(() => {
    if (!categoryFromUrl) {
      setFilteredProducts(products);
      return;
    }

    const categoryLower = categoryFromUrl.toLowerCase();
    const filtered = products.filter((p) => {
      const title = (p.title || '').toLowerCase();
      const productCat = (p.category || '').toLowerCase();
      const hasPlain = title.includes('plain');
      const hasOversized = title.includes('oversized') || productCat.includes('oversized');

      if (categoryLower === 'plain oversized') {
        return hasOversized && hasPlain;
      }
      if (categoryLower === 'oversized') {
        return hasOversized && !hasPlain;
      }
      return productCat === categoryLower;
    });

    console.log(`🔍 Filtered for "${categoryFromUrl}": ${filtered.length} products`);
    setFilteredProducts(filtered);
  }, [products, categoryFromUrl]);

  return (
    <div className="w-full">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-gray-600 mb-2">Home / Products</p>
          <h1 className="text-4xl font-bold mb-4">
            {categoryFromUrl ? `${categoryFromUrl}` : 'PRODUCTS'}
          </h1>
          {loading && <p className="text-sm text-gray-600">Loading products...</p>}
          {error && <p className="text-sm text-red-600">❌ Error: {error}</p>}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {filteredProducts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
            {categoryFromUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded max-w-md mx-auto text-sm text-gray-600">
                <p>Category: <code className="bg-gray-200 px-2 py-1">{categoryFromUrl}</code></p>
                <p>Total products in store: {products.length}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/pdtDetails/${product.slug || product.id}`}>
                <div className="group cursor-pointer">
                  {/* Image */}
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                    <Image
                      src={product.image || '/placeholder.png'}
                      alt={product.title || 'Product'}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  {/* Details */}
                  <p className="text-xs text-gray-600 uppercase tracked-wider mb-1">
                    {product.category || 'Uncategorized'}
                  </p>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-lg font-bold">₹{product.price || 'N/A'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
