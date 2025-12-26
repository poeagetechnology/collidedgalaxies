'use client';

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/src/components/admin/adminSidebar";
import { Pagination } from "@/src/components/admin/products/pagination";
import { db } from "@/firebase";
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}

export default function AdminsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [adminCount, setAdminCount] = useState(0);

    const itemsPerPage = 10;

    // Get current user
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setCurrentUserId(user.uid);
        }
    }, []);

    // Fetch users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const usersRef = collection(db, "users");
                const snapshot = await getDocs(usersRef);

                const userData: User[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name || doc.data().displayName || "N/A",
                    email: doc.data().email || "N/A",
                    role: doc.data().role,
                }));

                setUsers(userData);

                // Count admins
                const admins = userData.filter(user => user.role === "admin");
                setAdminCount(admins.length);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Check if current user is an admin
    const currentUserIsAdmin = users.find(u => u.id === currentUserId)?.role === "admin";

    // Make user an admin
    const handleMakeAdmin = async (userId: string) => {
        // Only admins can promote users
        if (!currentUserIsAdmin) {
            alert("Only admins can promote other users to admin!");
            return;
        }

        if (!confirm("Are you sure you want to make this user an admin?")) {
            return;
        }

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                role: "admin"
            });

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: "admin" } : user
            ));
            setAdminCount(adminCount + 1);

            alert("User promoted to admin successfully!");
        } catch (error) {
            console.error("Error making user admin:", error);
            alert("Failed to make user admin!");
        }
    };

    // Remove admin role
    const handleRemoveAdmin = async (userId: string) => {
        if (userId === currentUserId) {
            alert("You cannot remove your own admin role!");
            return;
        }

        if (!confirm("Are you sure you want to remove admin role from this user?")) {
            return;
        }

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                role: deleteField()
            });

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: undefined } : user
            ));
            setAdminCount(adminCount - 1);

            alert("Admin role removed successfully!");
        } catch (error) {
            console.error("Error removing admin role:", error);
            alert("Failed to remove admin role!");
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort users: admins first, then regular users
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = sortedUsers.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading users...</div>
            </div>
        );
    }

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 w-58 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                        <h1 className="text-xl sm:text-2xl font-bold">Admins</h1>
                        <div className="text-sm text-gray-600">
                            Total Admins: {adminCount} | Total Users: {filteredUsers.length}
                        </div>
                    </div>

                    {/* Info Banner */}
                    {currentUserIsAdmin && (
                        <>
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-sm text-blue-800">
                                <strong>Note:</strong> As an admin, you can promote other users to admin.
                                Those users can then promote others as well.
                            </div>

                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-sm text-red-800">
                                <strong>Important Warning:</strong> Do <u>not</u> make customers an admin by mistake.
                                Please verify the user carefully before promoting them, as admins have full system access.
                            </div>
                        </>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-96"
                        />
                    </div>

                    {/* Users Table */}
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
                                    <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
                                        Role
                                    </th>
                                    <th className="py-2 px-2 sm:px-4 border border-gray-300 text-left text-xs sm:text-sm whitespace-nowrap">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 border border-gray-300">
                                            {searchQuery ? "No users found matching your search." : "No users registered yet."}
                                        </td>
                                    </tr>
                                ) : (
                                    currentUsers.map((user, index) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                                                {user.name}
                                                {user.id === currentUserId && (
                                                    <span className="ml-2 text-xs text-blue-600">(You)</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm">
                                                {user.email}
                                            </td>
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300 text-xs sm:text-sm whitespace-nowrap">
                                                {user.role === "admin" ? (
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 sm:px-4 border border-gray-300">
                                                <div className="flex gap-1 sm:gap-2 whitespace-nowrap">
                                                    {user.role !== "admin" ? (
                                                        <button
                                                            onClick={() => handleMakeAdmin(user.id)}
                                                            disabled={!currentUserIsAdmin}
                                                            className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-2 sm:px-3 py-1 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRemoveAdmin(user.id)}
                                                            disabled={user.id === currentUserId}
                                                            className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-2 sm:px-3 py-1 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                        >
                                                            Remove Admin
                                                        </button>
                                                    )}
                                                </div>
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
                        totalItems={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </>
    );
}