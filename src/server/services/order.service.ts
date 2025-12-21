import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Order, FirebaseAddress } from '@/src/server/models/order.model';

/**
 * Fetch user email from users collection
 */
async function fetchUserEmail(userId: string): Promise<string> {
  if (!userId) return 'N/A';

  try {
    // First try: Direct document access using userId as document ID
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData?.email || 'N/A';
    }

    // Second try: Query by uid field if direct access fails
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.uid === userId || docSnap.id === userId) {
        return data.email || 'N/A';
      }
    }

    return 'N/A';
  } catch (error) {
    console.error('Error fetching user email for userId:', userId, error);
    return 'N/A';
  }
}

/**
 * Fetch all orders from Firebase
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const orderPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();

      // ✅ SKIP INCOMPLETE/INVALID ORDERS
      if (!data.userId || !data.items || data.items.length === 0) {
        console.warn('⚠️ Skipping incomplete order:', docSnapshot.id, {
          hasUserId: !!data.userId,
          hasItems: !!data.items,
          itemsLength: data.items?.length || 0
        });
        return null;
      }

      // Calculate total products
      const totalProducts = data.items?.reduce((sum: number, item: any) =>
        sum + (item.quantity || 0), 0
      ) || 0;

      // Get customer name
      const address = data.address as FirebaseAddress;
      const customerName = address
        ? `${address.firstName} ${address.lastName}`.trim()
        : 'Unknown Customer';

      // Fetch customer email from users collection
      const customerEmail = data.userId
        ? await fetchUserEmail(data.userId)
        : 'N/A';

      // Format shipping address
      const shippingAddress = address ? {
        street: `${address.streetAddress}${address.landmark ? ', ' + address.landmark : ''}`,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.mobileNumber,
      } : {
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
      };

      // Use paymentMode from database (correct)
      // ✅ Normalize paymentMode
      let paymentMode = 'unknown';

      if (data.paymentMode) {
        const pm = String(data.paymentMode).toLowerCase();

        if (pm.includes('cod') || pm.includes('cash')) {
          paymentMode = 'cod';
        } else if (
          pm.includes('online') ||
          pm.includes('razorpay') ||
          pm.includes('upi') ||
          pm.includes('card')
        ) {
          paymentMode = 'online';
        }
      } else {
        // fallback logic
        if (data.razorpayOrderId || data.razorpayPaymentId) {
          paymentMode = 'online';
        } else {
          paymentMode = 'cod';
        }
      }

      return {
        id: data.razorpayOrderId || docSnapshot.id,
        customerName,
        customerEmail,
        totalPrice: data.amount || 0,
        totalProducts,
        paymentMode,
        paymentId: data.razorpayPaymentId || '',
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'pending',   // <-- FIX
        orderDate: data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(),
        items: data.items || [],
        shippingAddress,
        razorpayOrderId: data.razorpayOrderId,
        razorpaySignature: data.razorpaySignature,
        userId: data.userId,
        firestoreDocId: docSnapshot.id,
      };
    });

    const fetchedOrders = await Promise.all(orderPromises);

    // ✅ FILTER OUT NULL VALUES (INCOMPLETE ORDERS)
    return fetchedOrders.filter(order => order !== null) as Order[];

  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders from Firebase');
  }
}

/**
 * Update order status via API route (uses Firebase Admin SDK on server)
 * This bypasses Firestore security rules and is the CORRECT way to update orders
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: 'pending' | 'paid',
  trackingNumber?: string
)
  : Promise<void> {
  try {
    // First, find the Firestore document ID for this Razorpay order ID
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);

    // Call the API route to update the order
    const response = await fetch('/api/admin/update-order-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        status,
        paymentStatus,
        trackingNumber,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update order status');
    }

    const result = await response.json();
    console.log('✅ Order status updated successfully:', result);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
}

/**
 * DEPRECATED: Direct Firestore update (blocked by security rules)
 * This function is kept for reference but should NOT be used
 */
export async function updateOrderStatusDirect(
  razorpayOrderId: string,
  status: Order['status']
): Promise<void> {
  console.warn('⚠️ updateOrderStatusDirect is deprecated. Use updateOrderStatus() instead.');

  try {
    // Find the document by razorpayOrderId
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);

    let orderDocId: string | null = null;
    querySnapshot.forEach((doc) => {
      if (doc.data().razorpayOrderId === razorpayOrderId) {
        orderDocId = doc.id;
      }
    });

    if (!orderDocId) {
      throw new Error('Order not found');
    }

    const orderRef = doc(db, 'orders', orderDocId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status in Firebase');
  }
}

/**
 * Get order by Razorpay Order ID from Firebase
 */
export async function getOrderById(razorpayOrderId: string): Promise<Order | null> {
  try {
    const orders = await getOrders();
    return orders.find(order => order.id === razorpayOrderId) || null;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw new Error('Failed to fetch order from Firebase');
  }
}

/**
 * Get customer email from users collection by userId
 * Call this if you need to fetch email separately
 */
export async function getCustomerEmail(userId: string): Promise<string> {
  return fetchUserEmail(userId);
}