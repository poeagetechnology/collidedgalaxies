import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/src/utils/seo.constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/products',
          '/pdtDetails/',
          '/about',
          '/contact',
          '/policies',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/checkout/',
          '/my-orders/',
          '/my-profile/',
          '/cart/',
          '/reset-password/',
          '/success/',
          '/test-payment/',
          '/*.json$',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
    ],
    sitemap: [
      `${SITE_CONFIG.domain}/sitemap.xml`,
      `${SITE_CONFIG.domain}/sitemap-products.xml`,
    ],
  };
}