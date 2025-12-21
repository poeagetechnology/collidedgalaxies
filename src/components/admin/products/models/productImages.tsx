'use client';

import Image from 'next/image';
import React from 'react';
import { Albert_Sans } from 'next/font/google';

const albertSans = Albert_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

interface Props {
  images: string[];
  imagePreviews: string[];
  imageInput: string;
  imageFiles: File[];
  isUploading: boolean;

  setImageInput: (v: string) => void;
  setImageFiles: (v: File[]) => void;
  setImagePreviews: (v: string[]) => void;

  handleAddImage: () => void;
  handleRemoveImage: (index: number) => void;
}

const ProductImages: React.FC<Props> = ({
  images,
  imagePreviews,
  imageInput,
  imageFiles,
  isUploading,

  setImageInput,
  setImageFiles,
  setImagePreviews,

  handleAddImage,
  handleRemoveImage,
}) => {
  return (
    <div className={`border p-3 sm:p-4 flex flex-col gap-3 ${albertSans.className}`}>
      <h2 className="font-semibold text-sm sm:text-base">Product Images (2-4)</h2>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 border overflow-hidden"
            >
              <Image
                src={img}
                alt={`img-${idx}`}
                fill
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-0 right-0 text-red-600 bg-white px-1 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Previews */}
      {imagePreviews.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {imagePreviews.map((preview, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 border overflow-hidden"
              >
                <Image
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setImageFiles([]);
              setImagePreviews([]);
              setImageInput('');
            }}
            className="mt-2 text-sm cursor-pointer text-red-600 hover:text-red-500 hover:underline"
          >
            Clear all previews
          </button>
        </div>
      )}

      {/* URL Input */}
      <div>
        <label className="block text-sm text-gray-700 mb-2">Image URL</label>

        <input
          type="url"
          value={imageInput}
          onChange={(e) => {
            setImageInput(e.target.value);

            if (e.target.value) {
              setImagePreviews([e.target.value]);
              setImageFiles([]);
            }
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full border p-2 text-sm"
          disabled={isUploading}
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
          {imagePreviews.length === 0 && (
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
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
              htmlFor="product-file-upload"
              className="w-full relative cursor-pointer text-center bg-white font-medium text-black hover:text-gray-700"
            >
              <span>Upload file(s)</span>

              <input
                id="product-file-upload"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={isUploading}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);

                  if (files.length > 0) {
                    const remainingSlots = 4 - images.length;
                    const filesToAdd = files.slice(0, remainingSlots);

                    setImageFiles(filesToAdd);
                    setImageInput('');

                    const previews: string[] = [];
                    let loadedCount = 0;

                    filesToAdd.forEach((file) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        previews.push(reader.result as string);
                        loadedCount++;

                        if (loadedCount === filesToAdd.length) {
                          setImagePreviews(previews);
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }
                }}
              />
            </label>
          </div>

          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB each
            <br />
            <span className="font-medium">Select multiple files at once</span>
          </p>
        </div>
      </div>

      {/* Add Image Button */}
      <button
        type="button"
        onClick={handleAddImage}
        disabled={isUploading || images.length >= 4}
        className={`px-4 py-2 text-white text-sm ${isUploading || images.length >= 4
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 cursor-pointer'
          }`}
      >
        {isUploading
          ? `Uploading ${imageFiles.length} image(s)...`
          : `Add Image(s) (${images.length}/4)`}
      </button>
    </div>
  );
};

export default ProductImages;
