import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { Order } from '@/src/server/models/order.model';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    status: Order['status'],
    paymentStatus: 'pending' | 'paid'
  ) => Promise<void>;
}

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<Order['status']>(
    order?.status || 'pending'
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
    order?.paymentStatus || "pending"
  );
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);


  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setSelectedPaymentStatus(order.paymentStatus || "pending");
    }
  }, [order]);

  if (!order) return null;

  // 🔥 Correct ID selector (online = Razorpay ID, COD = Firestore Doc ID)
  const isOnline = order.paymentMode?.toLowerCase().includes("online");
  const realOrderId = isOnline
    ? order.razorpayOrderId
    : order.firestoreDocId;

  const handleUpdatePaymentStatus = async () => {
    if (selectedPaymentStatus === order.paymentStatus) {
      alert("Payment status hasn't changed");
      return;
    }

    setUpdatingPayment(true);
    try {
      await onUpdateStatus(realOrderId!, selectedStatus, selectedPaymentStatus);
      alert("Payment status updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status!");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      alert("Status hasn't changed");
      return;
    }

    setUpdatingStatus(true);
    try {
      await onUpdateStatus(realOrderId!, selectedStatus, selectedPaymentStatus);
      alert("Order status updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status!");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${albertSans.className}`}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Order ID
              </h3>
              <p className="text-sm">{order.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Order Date
              </h3>
              <p className="text-sm">{formatDate(order.orderDate)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Customer Information
            </h3>
            <div className="bg-gray-50 p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {order.customerName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {order.customerEmail}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Payment Information
            </h3>
            <div className="bg-gray-50 p-4 space-y-2 text-sm">
              <span className="font-medium">Payment Mode:</span>{' '}
              {order.paymentMode === "cod"
                ? "Cash on Delivery"
                : order.paymentMode === "online"
                  ? "Online Payment"
                  : "Unknown"}
              {order.paymentId && (
                <p className="text-sm">
                  <span className="font-medium">Payment ID:</span>{' '}
                  {order.paymentId}
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">Total Amount:</span> ₹
                {order.totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Shipping Address
              </h3>
              <div className="bg-gray-50 p-4">
                <p className="text-sm">{order.shippingAddress.street}</p>
                <p className="text-sm">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-medium">Phone:</span>{' '}
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Order Items ({order.totalProducts})
            </h3>
            <div className="border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-bold">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-bold">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-bold">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-bold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <div className="w-24 h-32 flex-shrink-0 relative bg-gray-100">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {(item.size || item.color) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && ' | '}
                                {item.color && (
                                  <span className="inline-flex items-center gap-1">
                                    Color:
                                    <span
                                      className="inline-block w-3 h-3 rounded-full border border-gray-800"
                                      style={{ backgroundColor: item.color.hex }}
                                    />
                                    {item.color.name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm">
                        ₹{parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Payment Status */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Update Payment Status (Only for COD Orders)
            </h3>
            <div className="flex gap-3 items-center">
              <select
                value={selectedPaymentStatus}
                onChange={(e) =>
                  setSelectedPaymentStatus(e.target.value as 'pending' | 'paid')
                }
                className="flex-1 border cursor-pointer border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="pending">Payment Pending</option>
                <option value="paid">Payment Paid</option>
              </select>

              <button
                onClick={handleUpdatePaymentStatus}
                disabled={updatingPayment || selectedPaymentStatus === order.paymentStatus}
                className="bg-black text-white cursor-pointer px-6 py-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingPayment  ? "Updating..." : "Update"}
              </button>
            </div>
          </div>

          {/* Update Status */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Update Order Status
            </h3>
            <div className="flex gap-3 items-center">
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as Order['status'])
                }
                className="flex-1 border cursor-pointer border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus || selectedStatus === order.status}
                className="bg-black text-white px-6 py-2 cursor-pointer hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingStatus ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}