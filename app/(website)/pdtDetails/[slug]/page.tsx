import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/firebase-server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ProductDetailsClient from './productDetailsClient';

export const revalidate = 3600; // Revalidate every hour

// --- Interfaces & Sanitizer (Keep existing) ---
interface Product {
  id: string;
  title: string;
  description?: string;
  price?: number | string;
  discountPriceFirst10Days?: number | string;
  image?: string;
  images?: string[];
  colors?: any[];
  sizes?: string[];
  category?: string;
  slug?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  originalPrice?: number | string;
  [key: string]: any;
}

const sanitizeData = (id: string, data: any): Product => {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toString() || data.createdAt || null,
    updatedAt: data.updatedAt?.toDate?.().toString() || data.updatedAt || null,
  };
};

// --- Fetch Logic (Keep existing) ---
async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    console.log("=== getProductBySlug START ===");
    console.log("Slug received:", slug);
    console.log("Slug type:", typeof slug);
    console.log("Slug length:", slug?.length);
    
    // Decode slug in case it's URL encoded
    const decodedSlug = decodeURIComponent(slug);
    console.log("Decoded slug:", decodedSlug);
    
    const productsRef = collection(db, "products");
    
    // Strategy 1: Direct ID lookup (most common - just product.id)
    console.log("\n--- Strategy 1: Direct ID lookup ---");
    const idToTry = decodedSlug;
    console.log("Trying direct ID:", idToTry);
    
    try {
      const docRef = doc(db, 'products', idToTry);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("✅ SUCCESS: Found product by direct ID");
        console.log("Product ID:", docSnap.id);
        console.log("Product title:", docSnap.data().title);
        const sanitized = sanitizeData(docSnap.id, docSnap.data());
        console.log("=== getProductBySlug END - FOUND ===\n");
        return sanitized;
      } else {
        console.log("❌ No document at this ID path");
      }
    } catch (e) {
      console.log("❌ Error during direct ID lookup:", e instanceof Error ? e.message : String(e));
    }

    // Strategy 2: Slug field query
    console.log("\n--- Strategy 2: Slug field query ---");
    try {
      const q = query(productsRef, where("slug", "==", decodedSlug));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        console.log("✅ SUCCESS: Found product by slug field");
        const docSnap = snapshot.docs[0];
        console.log("Product ID:", docSnap.id);
        console.log("Product title:", docSnap.data().title);
        const sanitized = sanitizeData(docSnap.id, docSnap.data());
        console.log("=== getProductBySlug END - FOUND ===\n");
        return sanitized;
      } else {
        console.log("❌ No product found with slug field");
      }
    } catch (e) {
      console.log("❌ Error during slug field query:", e instanceof Error ? e.message : String(e));
    }

    // Strategy 3: Extract last segment (if slug has dashes)
    console.log("\n--- Strategy 3: Extract last segment ---");
    if (decodedSlug.includes('-')) {
      const possibleId = decodedSlug.split('-').pop();
      console.log("Extracted ID:", possibleId);
      
      if (possibleId && possibleId.length > 0) {
        try {
          const docRef = doc(db, 'products', possibleId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log("✅ SUCCESS: Found product by extracted ID");
            console.log("Product ID:", docSnap.id);
            console.log("Product title:", docSnap.data().title);
            const sanitized = sanitizeData(docSnap.id, docSnap.data());
            console.log("=== getProductBySlug END - FOUND ===\n");
            return sanitized;
          } else {
            console.log("❌ No product found with extracted ID");
          }
        } catch (e) {
          console.log("❌ Error during extracted ID lookup:", e instanceof Error ? e.message : String(e));
        }
      }
    }
    
    console.log("\n❌ PRODUCT NOT FOUND for any strategy");
    console.log("=== getProductBySlug END - NOT FOUND ===\n");
    return null;
  } catch (error) {
    console.error("🔴 CRITICAL ERROR in getProductBySlug:", error);
    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
}

// --- Metadata (Keep existing) ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }
  
  const price = product.price ?? product.discountPriceFirst10Days ?? 0;
  const imageUrl = product.image || product.images?.[0] || '';
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.collidedgalaxies.in/${imageUrl}`;

  return {
    title: `${product.title} | Collided Galaxies`,
    description: product.description,
    openGraph: {
      images: [absoluteImageUrl],
    },
  };
}

// --- Main Page Component (UPDATED WITH JSON-LD) ---
export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
      notFound();
  }

  // 1. Calculate variables for Schema
  const price = product.price ?? product.discountPriceFirst10Days ?? 0;
  const imageUrl = product.image || product.images?.[0] || '';
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.collidedgalaxies.in/${imageUrl}`;

  // 2. Create the Structured Data Object (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: absoluteImageUrl,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Collided Galaxies'
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.collidedgalaxies.in/pdtDetails/${slug}`,
      priceCurrency: 'INR',
      price: price,
      availability: 'https://schema.org/InStock', // You can make this dynamic based on product logic
      itemCondition: 'https://schema.org/NewCondition',
    }
  };

  return (
    <>
      {/* ✅ Inject Structured Data for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetailsClient initialProduct={product} slug={slug} />
    </>
  );
}