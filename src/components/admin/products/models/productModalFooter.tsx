'use client';

import React from 'react';

interface Props {
  isEditing: boolean;
  isUploading: boolean;
  isSizeChartUploading: boolean;
  handleSave: () => void;
  onClose: () => void;
  resetForm: () => void;
}

const ProductModalFooter: React.FC<Props> = ({
  isEditing,
  isUploading,
  isSizeChartUploading,
  handleSave,
  onClose,
  resetForm,
}) => {
  const disabled = isUploading || isSizeChartUploading;

  return (
    <>
      {isEditing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSave}
            disabled={disabled}
            className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>

          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={disabled}
            className="bg-gray-400 hover:bg-gray-500 cursor-pointer text-white px-4 py-2 text-sm sm:text-base disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={handleSave}
          disabled={disabled}
          className="bg-black hover:bg-gray-700 cursor-pointer text-white px-4 py-2 text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save
        </button>
      )}
    </>
  );
};

export default ProductModalFooter;
