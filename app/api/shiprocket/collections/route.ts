import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get('page') || '1';
    const limit = request.nextUrl.searchParams.get('limit') || '100';

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Fetch categories/collections from Firebase
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const collections: any[] = [];

    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      collections.push({
        id: doc.id,
        title: data.name || '',
        body_html: data.description || '',
        updated_at: data.updatedAt ? new Date(data.updatedAt).toISOString() : new Date().toISOString(),
        image: {
          src: data.image || ''
        }
      });
    });

    // Apply pagination
    const paginatedCollections = collections.slice(offset, offset + limitNum);

    return NextResponse.json({
      data: {
        collections: paginatedCollections,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: collections.length,
          pages: Math.ceil(collections.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}
