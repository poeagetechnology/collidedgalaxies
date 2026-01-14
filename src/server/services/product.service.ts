import { db } from '@/src/context/authProvider';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { Product, ProductFormData } from '../models/product.model';
import { generateUniqueSlug } from '../utils/slug.utils';

// Your existing functions
export const cleanNumber = (val: string | number | undefined | null): number | undefined => {
  if (typeof val === 'number') return Math.floor(val);
  if (typeof val === 'string') {
    const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

export const getProductUrl = (product: { id: string; slug?: string; title?: string }): string => {
  if (product.slug) {
    return `/pdtDetails/${product.slug}`;
  }
  const slug = product.title
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '') || 'product';
  return `/products/${slug}-${product.id}`;
};

export const getCurrentPrice = (product: Product): string | undefined => {
  if (!product.createdAt) return product.discountPriceFirst10Days;
  const createdDate = product.createdAt.toDate ? product.createdAt.toDate() : new Date();
  const diffDays = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 10 ? product.discountPriceFirst10Days : product.discountPriceAfter10Days;
};

export const subscribeToNewArrivals = (
  callback: (products: Product[]) => void,
  limitCount: number = 6
): Unsubscribe => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(limitCount * 2)); // Fetch more to account for filtering
  return onSnapshot(q, (snapshot) => {
    let items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    })) as Product[];
    
    // Sort: non-plain products first, then plain products
    items.sort((a, b) => {
      const aIsPlain = (a.title || "").toLowerCase().includes("plain") ||
                       (a.slug || "").toLowerCase().includes("plain");
      const bIsPlain = (b.title || "").toLowerCase().includes("plain") ||
                       (b.slug || "").toLowerCase().includes("plain");
      
      // Plain products come last
      if (aIsPlain && !bIsPlain) return 1;
      if (!aIsPlain && bIsPlain) return -1;
      
      // Both same type - maintain creation order
      return 0;
    });
    
    // Return only the requested limit
    callback(items.slice(0, limitCount));
  });
};

// NEW ADMIN FUNCTIONS
export const addProductAdmin = async (
  formData: ProductFormData
): Promise<void> => {
  const uniqueSlug = await generateUniqueSlug(formData.title || "product");

  const now = new Date();
  const diffDays = 0;
  const activePrice = diffDays < 10 
    ? formData.discountPriceFirst10Days 
    : formData.discountPriceAfter10Days;

  const productData: any = {
    ...formData,
    slug: uniqueSlug,
    price: activePrice,
    image: formData.images?.[0],
    createdAt: serverTimestamp(),
  };

  await addDoc(collection(db, "products"), productData);
};

export const updateProductAdmin = async (
  productId: string,
  formData: ProductFormData,
  originalProduct: Product | undefined
): Promise<void> => {
  const createdDate = originalProduct?.createdAt?.toDate 
    ? originalProduct.createdAt.toDate() 
    : new Date();
  const diffDays = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const activePrice = diffDays < 10 
    ? formData.discountPriceFirst10Days 
    : formData.discountPriceAfter10Days;

  let finalSlug = formData.slug || formData.title || "";
  if (formData.title !== originalProduct?.title) {
    finalSlug = await generateUniqueSlug(formData.title || "product");
  }

  const productRef = doc(db, "products", productId);
  const updateData: any = {
    title: formData.title,
    slug: finalSlug,
    discountPriceFirst10Days: formData.discountPriceFirst10Days,
    discountPriceAfter10Days: formData.discountPriceAfter10Days,
    originalPrice: formData.originalPrice,
    category: formData.category,
    description: formData.description,
    sizes: formData.sizes,
    colors: formData.colors,
    images: formData.images,
    price: activePrice,
    image: formData.images?.[0],
  };

  if (formData.sizeChart) {
    updateData.sizeChart = formData.sizeChart;
    updateData.sizeChartName = formData.sizeChartName || "Unnamed Chart";
  } else {
    updateData.sizeChart = deleteField();
    updateData.sizeChartName = deleteField();
  }

  await updateDoc(productRef, updateData);
};

export const deleteProductAdmin = async (productId: string): Promise<void> => {
  await deleteDoc(doc(db, "products", productId));
};

export const deleteSizeChartFromProducts = async (
  chartUrl: string,
  products: Product[]
): Promise<number> => {
  const productsWithThisChart = products.filter(p => p.sizeChart === chartUrl);
  
  if (productsWithThisChart.length === 0) {
    return 0;
  }

  const updatePromises = productsWithThisChart.map(product => {
    const productRef = doc(db, "products", product.id);
    return updateDoc(productRef, {
      sizeChart: deleteField(),
      sizeChartName: deleteField()
    });
  });

  await Promise.all(updatePromises);
  return productsWithThisChart.length;
};