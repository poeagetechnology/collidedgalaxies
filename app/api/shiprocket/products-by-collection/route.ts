import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const collectionId = request.nextUrl.searchParams.get('collection_id');
    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '100';

    if (!collectionId) {
      return NextResponse.json(
        { error: 'collection_id is required' },
        { status: 400 }
      );
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Fetch products by category from Firebase
    const productsQuery = query(
      collection(db, 'products'),
      where('category', '==', collectionId)
    );
    const productsSnapshot = await getDocs(productsQuery);
    const products: any[] = [];

    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        title: data.title || '',
        body_html: data.description || '',
        vendor: 'CollidedGalaxies',
        product_type: data.category || 'Apparel',
        updated_at: data.updatedAt ? new Date(data.updatedAt).toISOString() : new Date().toISOString(),
        status: data.status === 'active' ? 'active' : 'inactive',
        variants: (data.variants || []).map((variant: any, idx: number) => ({
          id: `${doc.id}-${idx}`,
          title: variant.color || variant.title || 'Default',
          price: data.discountPriceFirst10Days || data.originalPrice || '0',
          quantity: variant.quantity || 10,
          sku: variant.sku || `${doc.id}-${idx}`,
          updated_at: new Date().toISOString(),
          image: {
            src: data.image || data.images?.[0] || ''
          },
          weight: 0.5
        })),
        image: {
          src: data.image || data.images?.[0] || ''
        }
      });
    });

    // Apply pagination
    const paginatedProducts = products.slice(offset, offset + limitNum);

    return NextResponse.json({
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          pages: Math.ceil(products.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products by collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
