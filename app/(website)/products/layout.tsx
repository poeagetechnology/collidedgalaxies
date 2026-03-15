import { Metadata } from 'next';
import { generatePageMetadata } from '@/src/utils/seo.utils';

export const metadata: Metadata = generatePageMetadata('products', {
  alternates: {
    canonical: 'https://www.collidedgalaxies.com/products',
  },
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
