import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/src/server/services/order.service';
import type { Order } from '@/src/server/models/order.model';

export function useOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: Order['status'],
    paymentStatus: 'pending' | 'paid'
  ) => {
    try {
      await updateOrderStatus(orderId, status, paymentStatus);
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status, paymentStatus }
          : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    handleUpdateStatus,
  };
}
