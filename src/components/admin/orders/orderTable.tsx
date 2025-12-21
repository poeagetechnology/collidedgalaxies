import React from 'react';
import { Eye } from 'lucide-react';
import type { Order } from '@/src/server/models/order.model';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface OrderTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  startIndex?: number;
}

export function OrderTable({ orders, onViewDetails, startIndex = 0 }: OrderTableProps) {
  const getStatusColor = (status: Order['status']) => {
    const statusColors = {
      delivered: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className={`overflow-x-auto border border-gray-200 ${albertSans.className}`}>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              S.No
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Total Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Products
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Payment Mode
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No orders found
              </td>
            </tr>
          ) : (
            orders.map((order, index) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  ₹{order.totalPrice.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {order.totalProducts}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {order.paymentMode}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}
                  >
                    {capitalizeStatus(order.status)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => onViewDetails(order)}
                    className="inline-flex cursor-pointer items-center px-3 py-1.5 bg-black text-white hover:bg-gray-700 transition-colors"
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}