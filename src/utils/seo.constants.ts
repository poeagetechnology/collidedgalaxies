// SEO Constants - Single source of truth for all SEO data
export const SITE_CONFIG = {
  domain: 'https://www.collidedgalaxies.com',
  name: 'Collided Galaxies',
  shortName: 'COGA',
  description:
    'Collided Galaxies is a premium unisex clothing brand offering oversized t-shirts, both printed & plain. Shop aesthetic streetwear designed for comfort and style.',
  locale: 'en_US',
  twitter: '@collidedgalaxies',
  twitterCreator: '@collidedgalaxies',
  email: 'contact@collidedgalaxies.com',
};

export const BRAND_KEYWORDS = [
  'oversized t-shirts',
  'unisex clothing',
  'streetwear',
  'printed oversized tees',
  'plain oversized tees',
  'baggy tees',
  'men fashion',
  'women fashion',
  'minimal clothing',
  'aesthetic clothing',
  'Indian streetwear',
  'premium tees',
  'comfort wear',
  'casual clothing',
  'oversized fit',
];

export const COMPANY_INFO = {
  name: 'Collided Galaxies',
  url: 'https://www.collidedgalaxies.com',
  logo: 'https://www.collidedgalaxies.com/logo.png',
  description:
    'Premium unisex oversized t-shirt brand offering printed & plain designs',
  sameAs: [
    'https://www.instagram.com/collidedgalaxies',
    'https://www.facebook.com/collidedgalaxies',
    'https://www.youtube.com/collidedgalaxies',
  ],
};

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/collidedgalaxies',
  facebook: 'https://www.facebook.com/collidedgalaxies',
  twitter: 'https://twitter.com/collidedgalaxies',
  youtube: 'https://www.youtube.com/@collidedgalaxies',
};

export const PAGES_META = {
  home: {
    title: 'Collided Galaxies | Premium Oversized T-Shirts',
    description:
      'Shop high-quality oversized tees for men & women. Printed & plain drops. Premium fabric & unique designs. Fast shipping across India.',
    keywords: [
      'oversized t-shirts',
      'unisex clothing',
      'streetwear',
      'premium tees',
    ],
  },
  products: {
    title: 'Shop All Products | Collided Galaxies',
    description:
      'Browse our complete collection of oversized t-shirts. Printed designs, plain tees, and seasonal drops. Free shipping on orders above ₹500.',
    keywords: [
      'buy oversized t-shirts',
      'streetwear shop',
      'online clothing store',
    ],
  },
  about: {
    title: 'About Collided Galaxies | Our Story',
    description:
      'Discover the story behind Collided Galaxies. We create premium oversized t-shirts that blend comfort, style, and aesthetic appeal.',
    keywords: ['about us', 'clothing brand', 'streetwear story'],
  },
  contact: {
    title: 'Contact Us | Collided Galaxies',
    description:
      'Get in touch with Collided Galaxies. We respond to all inquiries within 24 hours. Contact us for support, feedback, or collaboration.',
    keywords: ['contact', 'customer support', 'get in touch'],
  },
};

// Sitemap priority configuration
export const SITEMAP_CONFIG = {
  homepage: { priority: 1.0, changeFrequency: 'daily' as const },
  category: { priority: 0.9, changeFrequency: 'daily' as const },
  product: { priority: 0.8, changeFrequency: 'weekly' as const },
  staticPages: { priority: 0.7, changeFrequency: 'monthly' as const },
  otherPages: { priority: 0.6, changeFrequency: 'monthly' as const },
};

// Cache configuration for better performance
export const CACHE_CONFIG = {
  products: 3600, // 1 hour
  categories: 7200, // 2 hours
  pages: 86400, // 24 hours
  images: 31536000, // 1 year
};
