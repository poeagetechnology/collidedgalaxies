'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Albert_Sans, Inria_Serif } from "next/font/google";
import { ADMIN_MENU_ITEMS } from "@/src/server/utils/constants";

const albertSans = Albert_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });
const inriaSerif = Inria_Serif({ subsets: ['latin'], weight: ['400', '700'] });

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col w-58 bg-white text-black shadow-lg lg:fixed lg:top-0 lg:left-0 lg:bottom-0 h-screen lg:h-full ${albertSans.className}`}>
      {/* Logo */}
      <div className="flex items-center justify-center h-28 flex-shrink-0">
        <h1 className={`${inriaSerif.className} text-5xl text-black`}>COGA</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
        {ADMIN_MENU_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-2 transition ${
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
      <div className="px-6 py-6 border-t border-gray-300 flex-shrink-0">
        <Link
          href="/"
          className="w-full px-4 py-2 font-medium bg-red-500 cursor-pointer text-white hover:bg-red-600 transition flex items-center justify-center gap-2"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}