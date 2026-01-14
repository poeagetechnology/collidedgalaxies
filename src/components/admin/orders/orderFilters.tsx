import React from 'react';

interface OrderFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function OrderFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <input
        type="text"
        placeholder="Search by customer name, email, or order ID..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black w-full"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border cursor-pointer border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}