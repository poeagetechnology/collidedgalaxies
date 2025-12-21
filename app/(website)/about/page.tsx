import { Metadata } from 'next';
import AboutClient from './aboutUsClient';

export const metadata: Metadata = {
  title: 'About Us | Collided Galaxies - Premium Oversized Streetwear',
  description: 'Experience the elegance of authenticity with Collided Galaxies (COGA). Discover the story behind our premium, timeless oversized fashion.',
  keywords: ['Collided Galaxies', 'COGA', 'premium oversized t-shirts', 'luxury streetwear', 'timeless fashion', 'sustainable clothing india'],
  openGraph: {
    title: 'About Collided Galaxies | Redefining Modern Luxury',
    description: 'We do not chase trends — we create classics. Discover the story behind COGA.',
    url: 'https://www.collidedgalaxies.in/about',
    siteName: 'Collided Galaxies',
    locale: 'en_US',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}