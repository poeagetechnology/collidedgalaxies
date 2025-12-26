import React from "react";
import Navbar from "@/src/components/header";
import Footer from "@/src/components/footer";

interface PolicyLayoutProps {
  children: React.ReactNode;
}

export default function PolicyLayout({ children }: PolicyLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white py-8 md:py-12">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}