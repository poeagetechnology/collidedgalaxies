'use client';

import React from 'react';
import type { SizeChartOption } from '@/src/server/models/product.model';
import Image from 'next/image';

interface Props {
  formSizeChart: string;
  formSizeChartName: string;
  sizeChartFile: File | null;
  sizeChartPreview: string;
  isSizeChartUploading: boolean;
  previousSizeCharts: SizeChartOption[];
  showSizeChartSelector: boolean;

  handleSizeChartFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadSizeChart: () => void;
  handleRemoveSizeChart: () => void;
  handleSelectPreviousSizeChart: (url: string, name: string) => void;
  onDeleteSizeChart: (url: string) => void;
  setShowSizeChartSelector: (v: boolean) => void;
}

const ProductSizeChart: React.FC<Props> = ({
  formSizeChart,
  formSizeChartName,
  sizeChartFile,
  sizeChartPreview,
  isSizeChartUploading,
  previousSizeCharts,
  showSizeChartSelector,

  handleSizeChartFileChange,
  handleUploadSizeChart,
  handleRemoveSizeChart,
  handleSelectPreviousSizeChart,
  onDeleteSizeChart,
  setShowSizeChartSelector,
}) => {
  return (
    <div className="border p-3 sm:p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-sm sm:text-base">Size Chart (Optional)</h2>

      {/* Current Size Chart */}
      {formSizeChart && (
        <div className="mb-2">
          <p className="text-xs text-gray-600 mb-2">
            Current Size Chart:{' '}
            <span className="font-semibold text-blue-600">
              {formSizeChartName || 'Unnamed Chart'}
            </span>
          </p>

          <div className="relative inline-block">
            <Image
              src={formSizeChart}
              alt="Size Chart"
              width={500}     // any reasonable width
              height={500}    // maintain aspect ratio — value doesn’t matter much
              className="max-w-full h-auto border border-gray-300 max-h-48 object-contain"
            />


            <button
              type="button"
              onClick={handleRemoveSizeChart}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Preview New Chart */}
      {sizeChartPreview && !formSizeChart && (
        <div className="mb-2">
          <p className="text-xs text-gray-600 mb-2">
            Preview:{' '}
            <span className="font-semibold">
              {sizeChartFile?.name}
            </span>
          </p>

          <Image
            src={sizeChartPreview}
            alt="Size Chart Preview"
            className="max-w-full h-auto border border-gray-300 max-h-48 object-contain"
          />
        </div>
      )}

      {/* Upload New Chart */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-700">Upload New Size Chart</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleSizeChartFileChange}
          disabled={isSizeChartUploading}
          className="border p-2 text-sm cursor-pointer"
        />

        {sizeChartFile && (
          <button
            type="button"
            onClick={handleUploadSizeChart}
            disabled={isSizeChartUploading}
            className={`px-4 py-2 text-white text-sm ${isSizeChartUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
              }`}
          >
            {isSizeChartUploading ? 'Uploading...' : 'Upload Size Chart'}
          </button>
        )}
      </div>

      {/* Previously Uploaded Size Charts */}
      {previousSizeCharts.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowSizeChartSelector(!showSizeChartSelector)}
            className="text-sm text-blue-600 hover:text-blue-700 underline cursor-pointer"
          >
            {showSizeChartSelector
              ? 'Hide'
              : 'Select from previously uploaded charts'}
          </button>

          {showSizeChartSelector && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto border p-3 bg-gray-50">
              {previousSizeCharts.map((chart, idx) => (
                <div
                  key={idx}
                  className={`relative border-2 transition-colors ${formSizeChart === chart.url
                      ? 'border-blue-600'
                      : 'border-gray-300'
                    }`}
                >
                  <div
                    onClick={() =>
                      handleSelectPreviousSizeChart(chart.url, chart.name)
                    }
                    className="cursor-pointer hover:opacity-80"
                  >
                    <Image
                      width={1000}
                      height={1000}
                      src={chart.url}
                      alt={chart.name}
                      className="w-full h-24 object-contain"
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate">
                      {chart.name}
                    </div>

                    {formSizeChart === chart.url && (
                      <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Delete Size Chart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSizeChart(chart.url);
                    }}
                    className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                    title="Delete this size chart from all products"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSizeChart;
