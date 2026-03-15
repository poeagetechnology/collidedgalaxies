import { MetadataRoute } from 'next';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { SITE_CONFIG, SITEMAP_CONFIG } from '@/src/utils/seo.constants';

// Revalidate sitemap every hour to capture new products
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.domain;

  // 1. Fetch all products from Firebase
  const productsRef = collection(db, 'products');
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const snapshot = await getDocs(productsRef);
    productUrls = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/pdtDetails/${data.slug || doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: SITEMAP_CONFIG.product.changeFrequency,
        priority: SITEMAP_CONFIG.product.priority,
      };
    });
  } catch (error) {
    console.error('Error generating product sitemap:', error);
  }

  // 2. Define static pages with priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: SITEMAP_CONFIG.homepage.changeFrequency,
      priority: SITEMAP_CONFIG.homepage.priority,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: SITEMAP_CONFIG.category.changeFrequency,
      priority: SITEMAP_CONFIG.category.priority,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: SITEMAP_CONFIG.staticPages.changeFrequency,
      priority: SITEMAP_CONFIG.staticPages.priority,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: SITEMAP_CONFIG.staticPages.changeFrequency,
      priority: SITEMAP_CONFIG.staticPages.priority,
    },
    {
      url: `${baseUrl}/policies`,
      lastModified: new Date(),
      changeFrequency: SITEMAP_CONFIG.otherPages.changeFrequency,
      priority: SITEMAP_CONFIG.otherPages.priority,
    },
  ];

  return [...staticPages, ...productUrls];
}