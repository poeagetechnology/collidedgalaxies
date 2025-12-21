import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import fs from 'fs';

// Types
interface UpdateOrderRequest {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  paymentStatus?: 'pending' | 'paid';
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderData {
  status: OrderStatus;
  userId?: string;
  [key: string]: any;
}

// Initialize firebase-admin
function initAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  let serviceAccount: any = null;
  const svcEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (svcEnv) {
    try {
      serviceAccount = JSON.parse(svcEnv);
    } catch (e) {
      try {
        serviceAccount = JSON.parse(Buffer.from(svcEnv, 'base64').toString('utf8'));
      } catch (err) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT env var');
      }
    }
  } else if (svcPath) {
    try {
      const raw = fs.readFileSync(svcPath, 'utf8');
      serviceAccount = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to read service account from path', svcPath, err);
    }
  }

  if (!serviceAccount) {
    throw new Error('Service account credentials not provided');
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount as any) });
  return admin;
}

let adminApp: typeof admin | null = null;
try {
  adminApp = initAdmin();
} catch (e) {
  console.error('Failed to initialize admin:', e);
  adminApp = null;
}

// Validate status transitions
function isValidTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const invalidTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: [],
    processing: [],
    shipped: ['pending'],
    delivered: ['pending', 'processing', 'shipped'],
    cancelled: []
  };

  return !invalidTransitions[currentStatus]?.includes(newStatus);
}

// Verify user authorization
async function verifyAuthorization(req: NextRequest, orderId: string, orderData: OrderData): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing authorization token' };
  }

  try {
    const token = authHeader.substring(7);
    const decodedToken = await adminApp!.auth().verifyIdToken(token);

    // Check if user is admin or owns the order
    const isAdmin = decodedToken.admin === true || decodedToken.role === 'admin';
    const ownsOrder = orderData.userId === decodedToken.uid;

    if (!isAdmin && !ownsOrder) {
      return { authorized: false, error: 'Insufficient permissions' };
    }

    return { authorized: true, userId: decodedToken.uid };
  } catch (err) {
    console.error('Token verification failed:', err);
    return { authorized: false, error: 'Invalid token' };
  }
}

export async function POST(req: NextRequest) {
  if (!adminApp) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  try {
    const body: UpdateOrderRequest = await req.json();
    const { orderId, status, trackingNumber, paymentStatus } = body;

    // Validate required fields
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Validate tracking number for shipped status (optional - uncomment if required)
    // if (status === 'shipped' && !trackingNumber) {
    //   return NextResponse.json(
    //     { error: 'Tracking number required for shipped status' },
    //     { status: 400 }
    //   );
    // }

    const firestore = adminApp.firestore();
    const orderRef = firestore.collection('orders').doc(orderId);

    // Check if order exists
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data() as OrderData;
    const currentStatus = orderData.status;

    // Verify authorization (optional - comment out if not needed)
    // const authResult = await verifyAuthorization(req, orderId, orderData);
    // if (!authResult.authorized) {
    //   return NextResponse.json(
    //     { error: authResult.error || 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // If only paymentStatus changed → skip status validation
    if (paymentStatus && status === currentStatus) {
      await orderRef.update({
        paymentStatus,
        updatedAt: adminApp.firestore.FieldValue.serverTimestamp()
      });

      return NextResponse.json({
        success: true,
        message: `Payment status updated to ${paymentStatus}`
      });
    }

    // Validate status transition
    if (!isValidTransition(currentStatus, status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: adminApp.firestore.FieldValue.serverTimestamp(),
    };

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;   // <-- THIS LINE SAVES IT TO FIREBASE
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    // Add tracking number and timestamp if provided
    if (status === 'shipped') {
      updateData.shippedAt = adminApp.firestore.FieldValue.serverTimestamp();
      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }
    }

    // Add delivery timestamp if delivered
    if (status === 'delivered') {
      updateData.deliveredAt = adminApp.firestore.FieldValue.serverTimestamp();
    }

    // Add cancellation timestamp if cancelled
    if (status === 'cancelled') {
      updateData.cancelledAt = adminApp.firestore.FieldValue.serverTimestamp();
    }

    // Add to status history ONLY if status actually changed
    if (status !== currentStatus) {
      updateData.statusHistory = adminApp.firestore.FieldValue.arrayUnion({
        status,
        timestamp: new Date().toISOString(),
        ...(trackingNumber && { trackingNumber })
      });
    }

    // Update the order
    await orderRef.update(updateData);

    console.log(`✅ Order ${orderId} status updated to ${status}`);

    // Get updated order data
    const updatedDoc = await orderRef.get();
    const updatedOrderData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: orderId,
        ...updatedOrderData
      }
    });

  } catch (err) {
    console.error('Error updating order status:', err);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}