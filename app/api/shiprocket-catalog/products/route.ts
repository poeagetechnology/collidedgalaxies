import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';

/**
 * Shiprocket Catalog API - Fetch Products
 * Returns all products in the seller's catalog with pagination
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageLimit = parseInt(searchParams.get('limit') || '100', 10);

    console.log(`🛍️ [Shiprocket Catalog] Fetching products - Page: ${page}, Limit: ${pageLimit}`);

    // Fetch products from Firestore
    const productsCollection = collection(db, 'products');
    const productsQuery = query(
      productsCollection,
      orderBy('createdAt', 'desc'),
      limit(pageLimit * page)
    );

    const snapshot = await getDocs(productsQuery);
    const allProducts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    // Implement pagination
    const startIndex = (page - 1) * pageLimit;
    const paginatedProducts = allProducts.slice(startIndex, startIndex + pageLimit);

    // Format products for Shiprocket
    const formattedProducts = paginatedProducts.map((product: any) => ({
      id: product.id,
      title: product.title || '',
      body_html: product.description || '',
      vendor: 'Collided Galaxies',
      product_type: product.category || 'Apparel',
      updated_at: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
      status: product.status || 'active',
      variants: formatVariants(product),
      image: {
        src: product.image || ''
      }
    }));

    console.log(`✅ [Shiprocket Catalog] Returning ${formattedProducts.length} products`);

    return NextResponse.json({
      status: 'success',
      page,
      limit: pageLimit,
      total: allProducts.length,
      data: formattedProducts
    });
  } catch (error) {
    console.error('❌ [Shiprocket Catalog] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Format product variants for Shiprocket
 * Creates variants for each size and color combination
 */
function formatVariants(product: any) {
  // Use the variants array from Firestore, if present
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((variant: any) => ({
      id: variant.numericId, // Use numericId for Shiprocket
      title: variant.title || `${variant.color} - ${variant.size}`,
      price: variant.price || product.discountPriceFirst10Days || product.originalPrice || '0',
      quantity: typeof variant.stock === 'number' ? variant.stock : (variant.quantity || 100),
      sku: variant.sku || `${product.slug || product.id}-${variant.color}-${variant.size}`.toUpperCase().replace(/\s+/g, '-'),
      updated_at: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
      image: {
        src: variant.image || product.image || ''
      },
      weight: variant.weight || product.weight || 0.5
    }));
  }
  // Fallback to old logic if no variants array
  return [
    {
      id: product.numericId || product.id,
      title: product.title || 'Default',
      price: product.discountPriceFirst10Days || product.originalPrice || '0',
      quantity: 100,
      sku: `${product.slug || product.id}-default`.toUpperCase(),
      updated_at: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
      image: {
        src: product.image || ''
      },
      weight: product.weight || 0.5
    }
  ];
}
