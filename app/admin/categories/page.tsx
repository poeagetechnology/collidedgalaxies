'use client';

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/src/components/admin/adminSidebar";
import { useCategoryStorage } from "@/src/hooks/useCategoryStorage";

import CategoryHeader from "@/src/components/admin/categories/categoryHeader";
import CategoryTable from "@/src/components/admin/categories/categoryTable";
import CategoryModal from "@/src/components/admin/categories/categoryModal";

export default function CategoriesPage() {
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } =
    useCategoryStorage();

  // ==== STATES ====
  const [catSearchQuery, setCatSearchQuery] = useState("");
  const [catInput, setCatInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catShowModal, setCatShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==== HANDLERS ====

  const handleAddCategory = async () => {
    if (!catInput.trim()) {
      alert("Category name is required!");
      return;
    }

    await addCategory(catInput, imageFile || undefined, imageUrl);

    setCatInput("");
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setCatShowModal(false);
    setCatEditingId(null);
  };

  const startEditCategory = (cat: { id: string; name: string; imageUrl?: string }) => {
    setCatEditingId(cat.id);
    setCatInput(cat.name);

    if (cat.imageUrl) {
      setImageUrl(cat.imageUrl);
      setImagePreview(cat.imageUrl);
    }

    setCatShowModal(true);
  };

  const saveEditCategory = async () => {
    if (!catInput.trim()) {
      alert("Category name is required!");
      return;
    }

    if (!catEditingId) return;

    await updateCategory(catEditingId, catInput, imageFile || undefined, imageUrl);

    setCatInput("");
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setCatEditingId(null);
    setCatShowModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id);
    }
  };

  const filteredCategories =
    catSearchQuery.trim()
      ? categories.filter(c =>
          c.name.toLowerCase().includes(catSearchQuery.trim().toLowerCase())
        )
      : categories;

  // ==== LOADING STATE ====
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading categories...</div>
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
          {/* CATEGORY HEADER */}
          <CategoryHeader
            onAdd={() => {
              setCatInput("");
              setCatEditingId(null);
              setImageFile(null);
              setImageUrl("");
              setImagePreview("");
              setCatShowModal(true);
            }}
          />

          {/* SEARCH BAR */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search categories..."
              value={catSearchQuery}
              onChange={e => setCatSearchQuery(e.target.value)}
              className="border border-black px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-96"
            />
          </div>

          {/* CATEGORY TABLE */}
          <CategoryTable
            categories={filteredCategories}
            onEdit={startEditCategory}
            onDelete={handleDeleteCategory}
          />
        </div>

        {/* MODAL */}
        <CategoryModal
          visible={catShowModal}
          close={() => {
            setCatShowModal(false);
            setCatInput("");
            setCatEditingId(null);
            setImageFile(null);
            setImageUrl("");
            setImagePreview("");
          }}
          catInput={catInput}
          setCatInput={setCatInput}
          imageFile={imageFile}
          setImageFile={setImageFile}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          catEditingId={catEditingId}
          saveEditCategory={saveEditCategory}
          handleAddCategory={handleAddCategory}
        />
      </div>
    </>
  );
}