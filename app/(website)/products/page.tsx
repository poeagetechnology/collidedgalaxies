import { Metadata } from 'next';
import ProductsPageWrapper from './productsPageWrapper'

export const metadata: Metadata = {
  title: 'Shop All Products | COGA',
  description: 'Browse all products in our collection. Premium quality, unique designs.',
  keywords: [
    'products',
    'shop',
    'clothing',
    'COGA products'
  ],
  openGraph: {
    title: 'Shop All Products | COGA',
    description: 'Explore our collection of premium products',
    url: 'https://www.coga.in/products',
  },
};

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return <ProductsPageWrapper />;
}