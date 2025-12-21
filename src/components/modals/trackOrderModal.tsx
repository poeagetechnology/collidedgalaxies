'use client';
import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import Image from 'next/image';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface OrderItem {
  image?: string;
  title?: string;
  name?: string;
  productTitle?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  size?: string;
  color?: {
    name: string;
    hex: string;
  } | string;
}

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    razorpayOrderId?: string;
    createdAt: any;
    amount: number;
    status?: string;
    items: OrderItem[];
  } | null;
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' }
];

const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose, order }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;
  if (!order) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() :
      timestamp.seconds ? new Date(timestamp.seconds * 1000) :
        new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentStatus = order.status || 'pending';
  const currentStepIndex = TIMELINE_STEPS.findIndex(step => step.key === currentStatus);

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ${albertSans.className} ${isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/40 backdrop-blur-sm'
        }`}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white shadow-2xl p-6 relative max-w-2xl w-full"
        style={{
          animation: isClosing
            ? 'modalZoomOut 0.3s ease-in forwards'
            : 'modalZoomIn 0.3s ease-out forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 cursor-pointer bg-white border p-2 z-50"
          type="button"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide -mx-6 -mt-6">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Track Order</h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Order Info */}
            <div className="bg-gray-50 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-600">Order ID:</span>
                <span className="text-sm font-medium">{order.razorpayOrderId || order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-600">Order Date:</span>
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-600">Total Amount:</span>
                <span className="text-sm font-bold">₹{Number(order.amount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-6">Order Status</h3>

              <div className="space-y-6">

                {/* Cancelled */}
                {currentStatus === "cancelled" && (
                  <div className="relative pl-10">
                    <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center border bg-red-500 text-white shadow-sm">
                      <X className="h-4 w-4" />
                    </span>

                    <div className="bg-red-50 p-4 shadow-sm">
                      <p className="font-semibold text-red-600">Order Cancelled</p>
                      <p className="text-sm text-gray-600 mt-1">
                        This order has been cancelled
                      </p>
                    </div>
                  </div>
                )}

                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isActive = index === currentStepIndex;
                  const isCancelled = currentStatus === "cancelled";

                  return (
                    <div key={step.key} className="relative pl-10">

                      {/* Vertical Line */}
                      {index < TIMELINE_STEPS.length - 1 && (
                        <div className="absolute left-5 top-8 h-full w-px bg-muted" />
                      )}

                      {/* Step Node */}
                      <span
                        className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center border bg-background shadow-sm ${isCompleted && !isCancelled
                            ? "border-green-500 text-green-600 bg-green-50"
                            : isActive && !isCancelled
                              ? "border-blue-500 text-blue-600 bg-blue-50"
                              : "border-gray-300 text-gray-400 bg-white"
                          }
                        `}
                      >
                        {isCompleted && !isCancelled ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <div
                            className={`h-2 w-2 rounded-full ${isActive && !isCancelled ? "bg-blue-500" : "bg-gray-300"
                              }`}
                          />
                        )}
                      </span>

                      {/* Card */}
                      <div className="bg-card p-2 shadow-sm">
                        <p
                          className={`font-semibold ${isCompleted && !isCancelled
                              ? "text-green-600"
                              : isActive && !isCancelled
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                        >
                          {step.label}
                        </p>

                        {isActive && !isCancelled && (
                          <p className="text-sm text-muted-foreground mt-1">Current Status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const colorObj = typeof item.color === 'object' ? item.color : null;
                  const colorString = typeof item.color === 'string' ? item.color : null;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border border-gray-200 bg-gray-50"
                    >
                      {/* Product Image */}
                      {item.image && (
                        <div className="w-20 h-24 flex-shrink-0 relative bg-white">
                          <Image
                            src={item.image}
                            alt={item.title || item.name || item.productTitle || 'Product'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="font-medium text-base mb-1">
                          {item.title || item.name || item.productTitle || 'Product'}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Quantity: {item.quantity ?? item.qty ?? 1}</div>
                          {item.size && <div>Size: {item.size}</div>}
                          {(colorObj || colorString) && (
                            <div className="flex items-center gap-2">
                              <span>Color:</span>
                              {colorObj ? (
                                <>
                                  <span
                                    className="inline-block w-4 h-4 rounded-full border border-gray-800"
                                    style={{ backgroundColor: colorObj.hex }}
                                  />
                                  <span>{colorObj.name}</span>
                                </>
                              ) : (
                                <span>{colorString}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="font-semibold text-base">
                        ₹{Number(item.price ?? 0).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-black text-white hover:bg-gray-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalZoomIn {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalZoomOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.7) translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default TrackOrderModal;