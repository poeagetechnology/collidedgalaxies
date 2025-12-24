'use client';

import AdminSidebar from "@/src/components/admin/adminSidebar";
import AdminGuard from "@/src/components/admin/adminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Always visible on large screens */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64">
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}