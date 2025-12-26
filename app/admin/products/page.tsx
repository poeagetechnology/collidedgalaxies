'use client';

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/src/components/admin/adminSidebar";
import { Menu, X } from "lucide-react";
import { useCategoryStorage } from "@/src/hooks/useCategoryStorage";
import { useProductManagement } from "@/src/hooks/useProductManagement";
import { ProductTable } from "@/src/components/admin/products/productTable";
import { Pagination } from "@/src/components/admin/products/pagination";
import ProductModal from "@/src/components/admin/products/productModal";
import {
  addProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  deleteSizeChartFromProducts,
} from "@/src/server/services/product.service";
import type { Product, ProductFormData } from "@/src/server/models/product.model";

export default function ProductPage() {
  const { categories, isLoading: categoriesLoading } = useCategoryStorage();
  const { products, previousSizeCharts, isLoading: productsLoading } = useProductManagement();

  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const itemsPerPage = 5;

  const filteredProducts = products.filter((product) =>
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAddProduct = async (
    formData: ProductFormData,
    hasCombos: boolean,
    comboData: { quantity?: string; originalPrice?: string; discountPrice?: string }
  ) => {
    try {
      await addProductAdmin(formData, hasCombos, comboData);
      alert("Product added!");
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const handleUpdateProduct = async (
    formData: ProductFormData,
    hasCombos: boolean,
    comboData: { quantity?: string; originalPrice?: string; discountPrice?: string }
  ) => {
    if (!editingProduct) return;

    try {
      await updateProductAdmin(editingProduct.id, formData, editingProduct, hasCombos, comboData);
      alert("Product updated!");
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductAdmin(id);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product!");
      }
    }
  };

  const handleDeleteSizeChart = async (chartUrl: string) => {
    const confirmDelete = confirm(
      "This will remove this size chart from all products using it. Are you sure?"
    );

    if (!confirmDelete) return;

    try {
      const count = await deleteSizeChartFromProducts(chartUrl, products);
      
      if (count === 0) {
        alert("No products are using this size chart.");
        return;
      }

      alert(`Size chart removed from ${count} product(s)!`);
    } catch (error) {
      console.error("Error deleting size chart:", error);
      alert("Failed to delete size chart!");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (
    formData: ProductFormData,
    hasCombos: boolean,
    comboData: { quantity?: string; originalPrice?: string; discountPrice?: string }
  ) => {
    if (!formData.sizes || formData.sizes.length === 0) {
      const confirmNoSizes = confirm(
        "This product has no sizes and will be displayed as 'Out of Stock' on the website. Do you want to continue?"
      );

      if (!confirmNoSizes) {
        return;
      }
    }

    if (editingProduct) {
      await handleUpdateProduct(formData, hasCombos, comboData);
    } else {
      await handleAddProduct(formData, hasCombos, comboData);
    }
  };

  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 w-58 h-screen bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
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
            <h1 className="text-xl sm:text-2xl font-bold">Product List</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-black hover:bg-gray-700 cursor-pointer text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base whitespace-nowrap"
            >
              Create
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-96"
            />
          </div>

          {/* Product Table */}
          <ProductTable
            products={currentProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Product Modal */}
        <ProductModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          editingProduct={editingProduct}
          categories={categories}
          previousSizeCharts={previousSizeCharts}
          onDeleteSizeChart={handleDeleteSizeChart}
        />
      </div>
    </>
  );
}