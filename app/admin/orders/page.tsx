'use client';

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/src/components/admin/adminSidebar";
import { Menu, X } from "lucide-react";
import { Pagination } from "@/src/components/admin/products/pagination";
import { OrderTable } from "@/src/components/admin/orders/orderTable";
import { OrderDetailsModal } from "@/src/components/admin/orders/orderDetailsModal";
import { OrderFilters } from "@/src/components/admin/orders/orderFilters";
import { useOrderManagement } from "@/src/hooks/useOrderManagement";
import type { Order } from "@/src/server/models/order.model";
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export default function OrdersPage() {
  const { orders, isLoading, handleUpdateStatus } = useOrderManagement();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const itemsPerPage = 7;

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading orders...</div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${albertSans.className} ${
          sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 w-58 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${albertSans.className} ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 text-gray-800 hover:text-gray-800 z-50 p-1 hover:bg-gray-200 transition-colors"
        >
          <X size={28} />
        </button>
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className={`${albertSans.className}`}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white drop-shadow-sm px-4 py-3 flex items-center sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page Content */}
        <div className="p-4 h-screen sm:pt-6 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
          </div>

          {/* Filters */}
          <OrderFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
          />

          {/* Order Table */}
          <OrderTable
            orders={currentOrders}
            onViewDetails={setSelectedOrder}
            startIndex={startIndex}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>
    </>
  );
}