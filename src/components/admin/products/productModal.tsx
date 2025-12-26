'use client';

import React, { useState, useEffect } from 'react';
import type { Product, ProductFormData, Color, SizeChartOption } from '@/src/server/models/product.model';
import { uploadToCloudinary } from '@/src/server/services/cloudinary.service';
import { slugify } from '@/src/server/utils/slugify';

// Child components (we'll create these next, one-by-one)
import ProductBasicInfo from "@/src/components/admin/products/productBasicInfo";
import ProductCombos from '@/src/components/admin/products/models/productCombos';
import ProductSizes from '@/src/components/admin/products/models/productSizes';
import ProductSizeChart from '@/src/components/admin/products/models/productSizeChart';
import ProductColors from '@/src/components/admin/products/models/productColors';
import ProductImages from '@/src/components/admin/products/models/productImages';
import ProductModalFooter from '@/src/components/admin/products/models/productModalFooter';

interface ProductModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (
    formData: ProductFormData,
    hasCombos: boolean,
    comboData: { quantity?: string; originalPrice?: string; discountPrice?: string }
  ) => Promise<void>;
  editingProduct?: Product | null;
  categories: Array<{ id: string; name: string }>;
  previousSizeCharts: SizeChartOption[];
  onDeleteSizeChart: (chartUrl: string) => Promise<void>;
}

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onClose,
  onSave,
  editingProduct,
  categories,
  previousSizeCharts,
  onDeleteSizeChart,
}) => {
  // --- constants
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  // --- form state (same shape & defaults)
  const [form, setForm] = useState<ProductFormData>({
    title: "",
    slug: "",
    discountPriceFirst10Days: "",
    discountPriceAfter10Days: "",
    originalPrice: "",
    category: "",
    description: "",
    sizes: [],
    colors: [],
    images: [],
    sizeChart: "",
    sizeChartName: "",
  });

  // --- local UI state (unchanged)
  const [colorInput, setColorInput] = useState("");
  const [colorNameInput, setColorNameInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [sizeChartPreview, setSizeChartPreview] = useState<string>("");
  const [isSizeChartUploading, setIsSizeChartUploading] = useState(false);
  const [showSizeChartSelector, setShowSizeChartSelector] = useState(false);

  const [hasCombos, setHasCombos] = useState(false);
  const [comboQuantity, setComboQuantity] = useState("");
  const [comboOriginalPrice, setComboOriginalPrice] = useState("");
  const [comboDiscountPrice, setComboDiscountPrice] = useState("");

  // --- sync editingProduct into form (exact same logic)
  useEffect(() => {
    if (editingProduct) {
      setForm({
        title: editingProduct.title || "",
        slug: editingProduct.slug || slugify(editingProduct.title || ""),
        discountPriceFirst10Days: editingProduct.discountPriceFirst10Days || "",
        discountPriceAfter10Days: editingProduct.discountPriceAfter10Days || "",
        originalPrice: editingProduct.originalPrice || "",
        category: editingProduct.category || "",
        description: editingProduct.description || "",
        sizes: editingProduct.sizes || [],
        colors: editingProduct.colors || [],
        images: editingProduct.images || [],
        sizeChart: editingProduct.sizeChart || "",
        sizeChartName: editingProduct.sizeChartName || "",
      });
      setHasCombos(Boolean(editingProduct.hasCombos));
      setComboQuantity(String(editingProduct.comboQuantity || ""));
      setComboOriginalPrice(String(editingProduct.comboOriginalPrice || ""));
      setComboDiscountPrice(String(editingProduct.comboDiscountPrice || ""));
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProduct]);

  // --- reset logic (unchanged)
  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      discountPriceFirst10Days: "",
      discountPriceAfter10Days: "",
      originalPrice: "",
      category: "",
      description: "",
      sizes: [],
      colors: [],
      images: [],
      sizeChart: "",
      sizeChartName: "",
    });
    setColorInput("");
    setColorNameInput("");
    setImageInput("");
    setImageFiles([]);
    setImagePreviews([]);
    setSizeChartFile(null);
    setSizeChartPreview("");
    setShowSizeChartSelector(false);
    setHasCombos(false);
    setComboQuantity("");
    setComboOriginalPrice("");
    setComboDiscountPrice("");
  };

  // --- handlers (kept exactly as in original)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugify(title)
    }));
  };

  const handleSizeToggle = (size: string) => {
    setForm((prev) => {
      const sizes = prev.sizes?.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...(prev.sizes || []), size];
      return { ...prev, sizes };
    });
  };

  const handleAddColor = () => {
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!hexRegex.test(colorInput)) {
      alert("Invalid HEX code!");
      return;
    }
    if (!colorNameInput.trim()) {
      alert("Please enter a color name!");
      return;
    }
    setForm((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: colorNameInput.trim(), hex: colorInput }]
    }));
    setColorInput("");
    setColorNameInput("");
  };

  const handleRemoveColor = (index: number) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleAddImage = async () => {
    const remainingSlots = 4 - (form.images?.length || 0);

    if (remainingSlots === 0) {
      alert("Maximum 4 images allowed!");
      return;
    }

    try {
      setIsUploading(true);
      const newImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const filesToUpload = imageFiles.slice(0, remainingSlots);

        for (const file of filesToUpload) {
          const imageUrl = await uploadToCloudinary(file);
          newImageUrls.push(imageUrl);
        }
      } else if (imageInput) {
        newImageUrls.push(imageInput);
      } else {
        alert("Please select file(s) or enter a URL!");
        setIsUploading(false);
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImageUrls].slice(0, 4)
      }));

      setImageInput("");
      setImageFiles([]);
      setImagePreviews([]);
      setIsUploading(false);
    } catch (error) {
      console.error("Error adding images:", error);
      alert("Failed to upload images!");
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSizeChartFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeChartFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSizeChartPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSizeChart = async () => {
    if (!sizeChartFile) {
      alert("Please select a size chart image!");
      return;
    }

    try {
      setIsSizeChartUploading(true);
      const sizeChartUrl = await uploadToCloudinary(sizeChartFile);
      setForm((prev) => ({
        ...prev,
        sizeChart: sizeChartUrl,
        sizeChartName: sizeChartFile.name
      }));
      setSizeChartFile(null);
      setSizeChartPreview("");
      setIsSizeChartUploading(false);
      alert("Size chart uploaded successfully!");
    } catch (error) {
      console.error("Error uploading size chart:", error);
      alert("Failed to upload size chart!");
      setIsSizeChartUploading(false);
    }
  };

  const handleSelectPreviousSizeChart = (chartUrl: string, chartName: string) => {
    setForm((prev) => ({
      ...prev,
      sizeChart: chartUrl,
      sizeChartName: chartName
    }));
    setShowSizeChartSelector(false);
  };

  const handleRemoveSizeChart = () => {
    setForm((prev) => ({ ...prev, sizeChart: "", sizeChartName: "" }));
    setSizeChartFile(null);
    setSizeChartPreview("");
  };

  const handleSave = async () => {
    if (
      !form.title ||
      !form.discountPriceFirst10Days ||
      !form.discountPriceAfter10Days ||
      !form.category ||
      !form.description
    ) {
      alert("All fields except original price are required!");
      return;
    }
    if ((form.images?.length || 0) < 2) {
      alert("At least 2 images are required!");
      return;
    }
    if ((form.sizes?.length || 0) === 0) {
      const proceed = confirm(
        "No sizes selected. This product will show as 'Out of Stock' on the website. Continue?"
      );
      if (!proceed) return;
    }
    if ((form.colors?.length || 0) === 0) {
      alert("Add at least one color!");
      return;
    }

    try {
      await onSave(form, hasCombos, {
        quantity: comboQuantity,
        originalPrice: comboOriginalPrice,
        discountPrice: comboDiscountPrice,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product!");
    }
  };

  if (!show) return null;

  // --- Render: same modal wrapper and layout, but broken into child components.
  // UI + logic unchanged; each section component will render the exact markup we had
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white p-4 sm:p-6 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 scrollbar-hide">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-600 hover:text-gray-800 cursor-pointer font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Basic info: title, slug, price fields, category, description */}
          <ProductBasicInfo
            form={form}
            handleTitleChange={handleTitleChange}
            handleChange={handleChange}
            categories={categories}
          />

          {/* Combos block */}
          <ProductCombos
            hasCombos={hasCombos}
            setHasCombos={setHasCombos}
            comboQuantity={comboQuantity}
            setComboQuantity={setComboQuantity}
            comboOriginalPrice={comboOriginalPrice}
            setComboOriginalPrice={setComboOriginalPrice}
            comboDiscountPrice={comboDiscountPrice}
            setComboDiscountPrice={setComboDiscountPrice}
          />

          {/* Description textarea already handled inside BasicInfo; sizes below */}
          <ProductSizes
            sizeOptions={sizeOptions}
            selectedSizes={form.sizes || []}
            handleSizeToggle={handleSizeToggle}
          />


          {/* Size Chart */}
          <ProductSizeChart
            formSizeChart={form.sizeChart || ""}
            formSizeChartName={form.sizeChartName || ""}
            sizeChartFile={sizeChartFile}
            sizeChartPreview={sizeChartPreview}
            isSizeChartUploading={isSizeChartUploading}
            previousSizeCharts={previousSizeCharts}
            showSizeChartSelector={showSizeChartSelector}

            handleSizeChartFileChange={handleSizeChartFileChange}
            handleUploadSizeChart={handleUploadSizeChart}
            handleRemoveSizeChart={handleRemoveSizeChart}
            handleSelectPreviousSizeChart={handleSelectPreviousSizeChart}
            onDeleteSizeChart={onDeleteSizeChart}
            setShowSizeChartSelector={setShowSizeChartSelector}
          />


          {/* Colors */}
          <ProductColors
            colors={form.colors || []}
            colorInput={colorInput}
            setColorInput={setColorInput}
            colorNameInput={colorNameInput}
            setColorNameInput={setColorNameInput}
            handleAddColor={handleAddColor}
            handleRemoveColor={handleRemoveColor}
          />


          {/* Images */}
          <ProductImages
            images={form.images || []}
            imageInput={imageInput}
            setImageInput={setImageInput}
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            imagePreviews={imagePreviews}
            setImagePreviews={setImagePreviews}
            isUploading={isUploading}
            handleAddImage={handleAddImage}
            handleRemoveImage={handleRemoveImage}
          />


          {/* Footer (save/cancel) */}
          <ProductModalFooter
            isEditing={Boolean(editingProduct)}
            isUploading={isUploading}
            isSizeChartUploading={isSizeChartUploading}
            handleSave={handleSave}
            onClose={onClose}
            resetForm={resetForm}
          />

        </div>
      </div>
    </div>
  );
};

export default ProductModal;
