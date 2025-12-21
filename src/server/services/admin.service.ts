import { db } from '@/src/context/authProvider';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export const checkUserRole = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role || null;
    }
    return null;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
};

export const isAdmin = async (uid: string): Promise<boolean> => {
  const role = await checkUserRole(uid);
  return role === 'admin';
};

interface DashboardMetrics {
  totalRevenue: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyOrders: number[];
  topSelling: {
    productId: string;
    title?: string;
    image?: string;
    soldQty: number;
    revenue: number;
  } | null;
  lowestSelling: {
    productId: string;
    title?: string;
    image?: string;
    soldQty: number;
    revenue: number;
  } | null;
  allProducts: Array<{
    productId: string;
    title?: string;
    image?: string;
    soldQty: number;
    revenue: number;
  }>;
}

export default async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const metrics: DashboardMetrics = {
      totalRevenue: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      monthlyOrders: new Array(12).fill(0),
      topSelling: null,
      lowestSelling: null,
      allProducts: [], // ✅ Add this
    };

    const productsSnapshot = await getDocs(collection(db, 'products'));
    metrics.totalProducts = productsSnapshot.size;

    const usersSnapshot = await getDocs(collection(db, 'users'));
    metrics.totalCustomers = usersSnapshot.size;

    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    metrics.totalOrders = ordersSnapshot.size;

    const productSales: Record<string, { qty: number; title?: string; image?: string; revenue: number }> = {};

    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      
      if (typeof order.amount === 'number') {
        metrics.totalRevenue += order.amount;
      }

      if (order.createdAt) {
        const date = order.createdAt.toDate();
        const month = date.getMonth();
        metrics.monthlyOrders[month]++;
      }

      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.productId || item.id;
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                qty: 0,
                title: item.title || item.name,
                image: item.image || item.imageUrl,
                revenue: 0,
              };
            }
            productSales[productId].qty += item.quantity || 1;
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });

    const productEntries = Object.entries(productSales);
    if (productEntries.length > 0) {
      productEntries.sort((a, b) => b[1].qty - a[1].qty);
      
      const top = productEntries[0];
      metrics.topSelling = {
        productId: top[0],
        title: top[1].title,
        image: top[1].image,
        soldQty: top[1].qty,
        revenue: top[1].revenue,
      };

      const lowest = productEntries[productEntries.length - 1];
      metrics.lowestSelling = {
        productId: lowest[0],
        title: lowest[1].title,
        image: lowest[1].image,
        soldQty: lowest[1].qty,
        revenue: lowest[1].revenue,
      };

      // ✅ Add all products array
      metrics.allProducts = productEntries.map(([id, data]) => ({
        productId: id,
        title: data.title,
        image: data.image,
        soldQty: data.qty,
        revenue: data.revenue,
      }));
    }

    return metrics;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {
      totalRevenue: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      monthlyOrders: new Array(12).fill(0),
      topSelling: null,
      lowestSelling: null,
      allProducts: [], // ✅ Add this
    };
  }
}