'use client';

import { X } from "lucide-react";
import AdminSidebar from "@/src/components/admin/adminSidebar";
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

type Props = {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
};

export default function MobileSidebar({ sidebarOpen, setSidebarOpen }: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${albertSans.className} ${
          sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 w-64 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${albertSans.className} ${
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
    </>
  );
}
