import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

/**
 * Shiprocket Catalog API - Fetch Collections
 * Returns all categories/collections in the seller's catalog
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

    console.log(`📚 [Shiprocket Catalog] Fetching collections - Page: ${page}, Limit: ${pageLimit}`);

    // Fetch categories/collections from Firestore
    const categoriesCollection = collection(db, 'categories');
    const categoriesQuery = query(
      categoriesCollection,
      orderBy('createdAt', 'desc'),
      limit(pageLimit * page)
    );

    const snapshot = await getDocs(categoriesQuery);
    const allCategories = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });

    // Implement pagination
    const startIndex = (page - 1) * pageLimit;
    const paginatedCategories = allCategories.slice(startIndex, startIndex + pageLimit);

    // Format collections for Shiprocket
    const formattedCollections = paginatedCategories.map((category: any) => ({
      id: category.id,
      updated_at: category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString(),
      title: category.name || category.title || '',
      body_html: category.description || '',
      image: {
        src: category.image || ''
      }
    }));

    console.log(`✅ [Shiprocket Catalog] Returning ${formattedCollections.length} collections`);

    return NextResponse.json({
      status: 'success',
      page,
      limit: pageLimit,
      total: allCategories.length,
      data: formattedCollections
    });
  } catch (error) {
    console.error('❌ [Shiprocket Catalog] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
