'use client';

import { Suspense } from 'react';
import ProductsPageNew from './productsPageNew';

function ProductsContent() {
  return <ProductsPageNew />;
}

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-600">Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
