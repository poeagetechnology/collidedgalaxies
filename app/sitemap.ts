import { MetadataRoute } from 'next';
import { db } from '@/firebase'; // ⚠️ Ensure this path points to your firebase config
import { collection, getDocs } from 'firebase/firestore';

// This ensures the sitemap regenerates every hour to capture new products
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ⚠️ REPLACE with your actual live domain
  const baseUrl = 'https://www.collidedgalaxies.in';

  // 1. Fetch all products from Firebase
  const productsRef = collection(db, 'products');
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const snapshot = await getDocs(productsRef);
    productUrls = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        // ⚠️ URL MATCHING: specific folder name for your product page
        // If your file is at app/pdtDetails/[slug]/page.tsx, keep it as is.
        // If it is app/product/[slug]/page.tsx, change 'pdtDetails' to 'product'
        url: `${baseUrl}/pdtDetails/${data.slug || doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error("Error generating product sitemap:", error);
  }

  // 2. Define your static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...productUrls];
}