'use client';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function TestFirebasePage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🧪 TEST PAGE: Starting Firebase connection...');
    setStatus('Connecting to Firebase...');
    
    try {
      console.log('🧪 db object:', db);
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      console.log('🧪 Query created');
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('🧪 Snapshot received, docs:', snapshot.size);
          const data: any[] = [];
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          console.log('🧪 Products loaded:', data.length);
          setProducts(data);
          setStatus(`✅ Loaded ${data.length} products from Firebase`);
        },
        (err) => {
          console.error('🧪 Firebase error:', err);
          setError(`Firebase error: ${err.message}`);
          setStatus('❌ Firebase error');
        }
      );

      return () => {
        console.log('🧪 Unsubscribing');
        unsubscribe();
      };
    } catch (err: any) {
      console.error('🧪 Setup error:', err);
      setError(`Error: ${err.message}`);
      setStatus('❌ Setup error');
    }
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🧪 Firebase Test Page</h1>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
        <p className="text-sm"><strong>Status:</strong> {status}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-sm text-red-800"><strong>Error:</strong> {error}</p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 p-4 rounded mb-4">
        <p className="text-sm"><strong>Products Found:</strong> {products.length}</p>
        {products.length > 0 && (
          <div className="mt-4">
            <p className="text-sm mb-2"><strong>First 5 Products:</strong></p>
            <ul className="text-xs">
              {products.slice(0, 5).map(p => (
                <li key={p.id} className="mb-2 p-2 bg-white border border-gray-300 rounded">
                  <strong>{p.title || 'No title'}</strong>
                  <br />
                  Category: {p.category || 'empty'}
                  <br />
                  Price: ₹{p.price || 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-xs">
        <p><strong>Debug Info:</strong></p>
        <p>Check browser console (F12 → Console) for "🧪" messages</p>
        <p>If you see "Loaded X products", Firebase is working!</p>
      </div>
    </div>
  );
}
