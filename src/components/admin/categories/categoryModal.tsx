'use client';

import Image from "next/image";
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

type Props = {
  visible: boolean;
  close: () => void;

  catInput: string;
  setCatInput: (v: string) => void;

  imageFile: File | null;
  setImageFile: (f: File | null) => void;

  imageUrl: string;
  setImageUrl: (v: string) => void;

  imagePreview: string;
  setImagePreview: (v: string) => void;

  catEditingId: string | null;
  saveEditCategory: () => void;
  handleAddCategory: () => void;
};

export default function CategoryModal({
  visible,
  close,

  catInput,
  setCatInput,

  imageFile,
  setImageFile,

  imageUrl,
  setImageUrl,

  imagePreview,
  setImagePreview,

  catEditingId,
  saveEditCategory,
  handleAddCategory
}: Props) {
  if (!visible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${albertSans.className}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white p-4 sm:p-6 shadow-lg w-full max-w-sm max-h-[90vh] overflow-y-auto z-50 scrollbar-hide">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">
            {catEditingId ? "Edit Category" : "Add Category"}
          </h2>

          <button onClick={close} className="text-gray-600 hover:text-gray-800 cursor-pointer font-bold text-xl">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <input
            className="border p-2 text-sm sm:text-base"
            placeholder="Category Name"
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
          />

          <div className="space-y-4">
            <label className="block text-base font-medium text-gray-700">Category Image</label>

            {/* Preview */}
            {imagePreview && (
              <div className="flex flex-col mt-4 items-center">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={128}            // same as w-32 (32 * 4 = 128px)
                  height={128}           // same as h-32
                  className="object-cover rounded w-32 h-32"
                  unoptimized            // required for blob/base64 preview
                />

                <button
                  onClick={() => {
                    setImageFile(null);
                    setImageUrl("");
                    setImagePreview("");
                  }}
                  className="mt-2 text-sm cursor-pointer text-red-600 hover:text-red-500 hover:underline"
                >
                  Remove image
                </button>
              </div>
            )}

            {/* URL Input */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Image URL</label>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full border p-2 text-sm sm:text-base"
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed">
              <div className="space-y-1 text-center">
                {!imagePreview && (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="w-full relative cursor-pointer text-center bg-white font-medium text-black hover:text-gray-700"
                  >
                    <span>Upload a file</span>

                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImageUrl("");
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {catEditingId ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={saveEditCategory}
                className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 text-sm sm:text-base"
              >
                Save Changes
              </button>

              <button
                onClick={close}
                className="bg-gray-400 hover:bg-gray-500 cursor-pointer text-white px-4 py-2 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddCategory}
              className="bg-black hover:bg-gray-700 cursor-pointer text-white px-4 py-2 text-sm sm:text-base"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
