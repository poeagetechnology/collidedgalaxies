"use client";

import React, { useState, useEffect } from "react";
import { useProductManagement } from "@/src/hooks/useProductManagement";
import type { Bundle, BundleFormData } from "@/src/server/models/bundle.model";
import BundleTable from "@/src/components/admin/bundles/bundleTable";
import BundleModal from "@/src/components/admin/bundles/bundleModal";
import { Pagination } from "@/src/components/admin/products/pagination";

export default function BundlesPage() {
  const { products, isLoading: productsLoading } = useProductManagement();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 5;

  // Fetch bundles
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/bundles");
        if (response.ok) {
          const data = await response.json();
          setBundles(data);
        }
      } catch (error) {
        console.error("Error fetching bundles:", error);
        alert("Failed to fetch bundles");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const filteredBundles = bundles.filter((bundle) =>
    bundle.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBundles = filteredBundles.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddBundle = async (formData: BundleFormData) => {
    try {
      const response = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newBundle = await response.json();
        setBundles([newBundle, ...bundles]);
        alert("Bundle created successfully!");
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding bundle:", error);
      alert("Failed to create bundle");
    }
  };

  const handleUpdateBundle = async (formData: BundleFormData) => {
    if (!editingBundle) return;

    try {
      const response = await fetch(
        `/api/admin/bundles?id=${editingBundle.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        setBundles(
          bundles.map((b) =>
            b.id === editingBundle.id ? { ...editingBundle, ...formData } : b,
          ),
        );
        alert("Bundle updated successfully!");
        setEditingBundle(null);
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating bundle:", error);
      alert("Failed to update bundle");
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (confirm("Are you sure you want to delete this bundle?")) {
      try {
        const response = await fetch(`/api/admin/bundles?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setBundles(bundles.filter((b) => b.id !== id));
          alert("Bundle deleted successfully!");
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error("Error deleting bundle:", error);
        alert("Failed to delete bundle");
      }
    }
  };

  const handleEditBundle = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBundle(null);
  };

  const handleSaveBundle = async (formData: BundleFormData) => {
    if (editingBundle) {
      await handleUpdateBundle(formData);
    } else {
      await handleAddBundle(formData);
    }
  };

  if (productsLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 pt-4">
        <h1 className="text-xl sm:text-2xl font-bold">Bundle Offers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black hover:bg-gray-700 cursor-pointer text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base whitespace-nowrap"
        >
          Create Bundle
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 px-4">
        <input
          type="text"
          placeholder="Search bundles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-96"
        />
      </div>

      {/* Bundle Table Container */}
      <div className="mb-6 px-4 overflow-x-auto w-full">
        <BundleTable
          bundles={currentBundles}
          onEdit={handleEditBundle}
          onDelete={handleDeleteBundle}
        />
      </div>

      {/* Pagination */}
      <div className="px-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredBundles.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Bundle Modal */}
      <BundleModal
        show={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveBundle}
        editingBundle={editingBundle}
        products={products}
      />
    </>
  );
}
