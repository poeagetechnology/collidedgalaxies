import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {

  const baseUrl = 'https://www.collidedgalaxies.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/checkout/',
          '/account/',
          '/cart/',
          '/login/',
          '/signup/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}