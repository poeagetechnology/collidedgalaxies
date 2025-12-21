import { Metadata } from 'next';
import ContactClient from './contactClient';

export const metadata: Metadata = {
  title: 'Contact Us | Collided Galaxies Customer Support',
  description: 'Get in touch with Collided Galaxies. Support, questions, or collaborations - we are here to help.',
  keywords: ['contact collided galaxies', 'customer support', 'help', 'luxury streetwear support'],
  openGraph: {
    title: 'Contact Collided Galaxies',
    description: 'Get support or ask questions about our oversized t-shirts',
    url: 'https://www.collidedgalaxies.in/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}