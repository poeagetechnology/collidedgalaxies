'use client';

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/src/components/admin/adminSidebar";
import { Pagination } from "@/src/components/admin/products/pagination";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface Customer {
    id: string;
    name: string;
    email: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 12;

    // Fetch customers from Firestore
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoading(true);
                const customersRef = collection(db, "users"); // Adjust collection name as needed
                const snapshot = await getDocs(customersRef);

                const customerData: Customer[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name || doc.data().displayName || "N/A",
                    email: doc.data().email || "N/A",
                }));

                setCustomers(customerData);
            } catch (error) {
                console.error("Error fetching customers:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Filter customers based on search query
    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading customers...</div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${albertSans.className} ${sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 w-58 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${albertSans.className} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                        <h1 className="text-xl sm:text-2xl font-bold">Customers</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-2">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-96"
                        />
                    </div>


                    <div className="w-full text-base text-gray-600 my-4">
                        <span className="text-black font-semibold">Total Customers: </span>{filteredCustomers.length}
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white border border-collapse border-gray-200 shadow-md min-w-max">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
                                        S.No
                                    </th>
                                    <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
                                        Name
                                    </th>
                                    <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
                                        Email
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500 border border-gray-300">
                                            {searchQuery ? "No customers found matching your search." : "No customers registered yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    currentCustomers.map((customer, index) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                                                {customer.name}
                                            </td>
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm">
                                                {customer.email}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredCustomers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </>
    );
}