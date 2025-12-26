'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU_ITEMS } from "@/src/server/utils/constants";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-full sm:w-56 md:w-64 bg-white text-black shadow-lg lg:fixed lg:top-0 lg:left-0 lg:bottom-0 h-screen lg:h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-20 sm:h-24 md:h-28 flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-black">COGA</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-y-auto">
        {ADMIN_MENU_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm transition ${
              pathname === item.href
                ? "bg-black text-white"
                : "hover:bg-gray-200 text-black"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Back to Home */}
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 border-t border-gray-300 flex-shrink-0">
        <Link
          href="/"
          className="w-full px-2 sm:px-3 md:px-4 py-2 font-medium bg-red-500 cursor-pointer text-white hover:bg-red-600 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}