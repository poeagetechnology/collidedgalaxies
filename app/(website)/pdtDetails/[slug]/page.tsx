import { Metadata } from 'next';
import { db } from '@/firebase-server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import ProductDetailsClient from './productDetailsClient';

// --- Interfaces & Sanitizer (Keep existing) ---
interface Product {
  id: string;
  title: string;
  description?: string;
  price?: number;
  discountPriceFirst10Days?: number;
  image?: string;
  images?: string[];
  colors?: any[];
  sizes?: string[];
  category?: string;
  slug?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
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
    console.log("Attempting to fetch product with slug:", slug);
    
    const productsRef = collection(db, "products");
    
    // First try: exact slug match
    const q = query(productsRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      console.log("Found product by slug match");
      return sanitizeData(docSnap.id, docSnap.data());
    }

    // Second try: extract ID from slug (last segment after dash)
    const possibleId = slug.split('-').pop();
    console.log("Extracted possible ID from slug:", possibleId);
    
    if (possibleId && possibleId.length > 0) {
      const docRef = doc(db, 'products', possibleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Found product by ID:", possibleId);
        return sanitizeData(docSnap.id, docSnap.data());
      } else {
        console.log("No product found with ID:", possibleId);
      }
    }
    
    // Third try: use the entire slug as ID (in case it's just the ID without title)
    const docRef = doc(db, 'products', slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Found product using entire slug as ID");
      return sanitizeData(docSnap.id, docSnap.data());
    }
    
    console.log("Product not found for slug:", slug);
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
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
      return <div className="text-center py-20">Product Not Found</div>;
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