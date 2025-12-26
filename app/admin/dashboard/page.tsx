'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '@/src/components/admin/adminSidebar';
import DashboardRealtime from '@/src/components/admin/DashboardRealtime';

export default function DashboardPage({ initial }: { initial?: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 w-58 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
      <div>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white drop-shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs bg-green-100 text-green-700 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs bg-green-100 text-green-700 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
          </div>

          {/* Dashboard Content */}
          <DashboardRealtime initial={initial} />
        </div>
      </div>
    </>
  );
}