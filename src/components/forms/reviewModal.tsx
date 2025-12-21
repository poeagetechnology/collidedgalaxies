'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ReviewFormData {
    rating: number;
    title: string;
    content: string;
    author: string;
    photos: string[];
}

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: ReviewFormData) => Promise<void>;
    isSubmitting?: boolean;
    initialData?: ReviewFormData | null;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
    initialData = null,
}) => {
    const [formData, setFormData] = useState<ReviewFormData>({
        rating: 0,
        title: '',
        content: '',
        author: '',
        photos: [],
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isClosing, setIsClosing] = useState(false);
    const [warning, setWarning] = useState('');

    // Load edit data or reset for new review
    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setFormErrors({});
            setWarning('');

            if (initialData) {
                setFormData({
                    rating: initialData.rating,
                    title: initialData.title,
                    content: initialData.content,
                    author: initialData.author,
                    photos: initialData.photos || [],
                });
            } else {
                setFormData({
                    rating: 0,
                    title: '',
                    content: '',
                    author: '',
                    photos: [],
                });
            }
        }
    }, [isOpen, initialData]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) handleClose();
    };

    const handleRatingClick = (rating: number) => {
        setFormData({ ...formData, rating });
        if (formErrors.rating) {
            const newErrors = { ...formErrors };
            delete newErrors.rating;
            setFormErrors(newErrors);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (formErrors[name]) {
            const newErrors = { ...formErrors };
            delete newErrors[name];
            setFormErrors(newErrors);
        }

        if (warning) setWarning('');
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (formData.rating === 0) errors.rating = 'Please select a rating';
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.content.trim()) errors.content = 'Review content is required';
        if (!formData.author.trim()) errors.author = 'Display name is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await onSubmit(formData);
        } catch (error) {
            setWarning('Failed to submit review. Please try again.');
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }).map((_, i) => (
            <button
                key={i}
                type="button"
                onClick={() => handleRatingClick(i + 1)}
                className="relative group"
            >
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={i + 1 <= formData.rating ? '#000' : 'none'}
                    stroke="#000"
                    strokeWidth="1"
                    className={`w-8 h-8 transition-all ${
                        i + 1 <= formData.rating
                            ? 'opacity-100'
                            : 'opacity-30 group-hover:opacity-60'
                    }`}
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </button>
        ));
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-all duration-300 ${
                isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/40 backdrop-blur-sm'
            }`}
            onClick={handleBackdropClick}
        >
            <div
                className="relative max-w-xl w-full"
                style={{
                    animation: isClosing
                        ? 'modalZoomOut 0.3s ease-in forwards'
                        : 'modalZoomIn 0.3s ease-out forwards',
                }}
            >
                <button
                    onClick={handleClose}
                    className="absolute -top-3 -right-3 cursor-pointer bg-white border p-2 z-50"
                    type="button"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <div className="bg-white shadow-2xl p-6 relative w-full max-h-[80vh] overflow-y-auto scrollbar-hide">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {initialData ? 'Edit Review' : 'Write a Review'}
                    </h2>

                    <div className="space-y-6">

                        {/* Rating */}
                        <div>
                            <label className="block font-medium mb-3 text-gray-900">Rating</label>
                            <div className="flex gap-3 cursor-pointer">{renderStars()}</div>
                            {formErrors.rating && (
                                <p className="text-red-600 text-sm mt-2">{formErrors.rating}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block font-medium mb-2 text-gray-900">
                                Review Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Summarize your review in a few words"
                                maxLength={100}
                                className="w-full px-4 py-2.5 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            {formErrors.title && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
                            )}
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block font-medium mb-2 text-gray-900">
                                Your Review
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Share your experience with this product..."
                                rows={5}
                                maxLength={1000}
                                className="w-full px-4 py-2.5 border border-black focus:outline-none focus:ring-2 focus:ring-black resize-none"
                            />
                            {formErrors.content && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.content}</p>
                            )}
                        </div>

                        {/* Author */}
                        <div>
                            <label className="block font-medium mb-2 text-gray-900">
                                Display Name
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                placeholder="How should we display your name?"
                                maxLength={50}
                                className="w-full px-4 py-2.5 border border-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            {formErrors.author && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.author}</p>
                            )}
                        </div>

                        {/* 🔥 DEVICE FILE UPLOAD (matches your reference modal) */}
                        <div>
                            <label className="block font-medium mb-2 text-gray-900">
                                Add Photos ({formData.photos.length}/5)
                            </label>

                            {/* Preview Grid */}
                            {formData.photos.length > 0 && (
                                <div className="flex gap-3 flex-wrap mb-4">
                                    {formData.photos.map((photo, idx) => (
                                        <div key={idx} className="relative group">
                                            <Image
                                                src={photo}
                                                alt={`Photo ${idx + 1}`}
                                                className="w-24 h-24 object-cover border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        photos: prev.photos.filter(
                                                            (_, i) => i !== idx
                                                        ),
                                                    }))
                                                }
                                                className="absolute -top-2 -right-2 cursor-pointer bg-red-600 text-white w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Box */}
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed">
                                <div className="text-center">
                                    {formData.photos.length === 0 && (
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

                                    <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                                        <span>Upload Images</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="sr-only"
                                            onChange={(e) => {
                                                const files = e.target.files
                                                    ? Array.from(e.target.files)
                                                    : [];

                                                const allowed =
                                                    5 - formData.photos.length;

                                                const selected = files.slice(
                                                    0,
                                                    allowed
                                                );

                                                selected.forEach((file) => {
                                                    const reader =
                                                        new FileReader();
                                                    reader.onloadend = () => {
                                                        setFormData(
                                                            (prev) => ({
                                                                ...prev,
                                                                photos: [
                                                                    ...prev.photos,
                                                                    reader
                                                                        .result as string,
                                                                ],
                                                            })
                                                        );
                                                    };
                                                    reader.readAsDataURL(file);
                                                });
                                            }}
                                        />
                                    </label>

                                    <p className="text-xs text-gray-500 mt-1">
                                        PNG / JPG up to 10MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {warning && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">
                                {warning}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-6 py-3 border border-black text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 group"
                            >
                                <span>
                                    {isSubmitting
                                        ? 'Submitting...'
                                        : initialData
                                        ? 'Update Review'
                                        : 'Submit Review'}
                                </span>
                                {!isSubmitting && (
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="group-hover:translate-x-1 transition-transform"
                                    >
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes modalZoomIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.85) translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                @keyframes modalZoomOut {
                    0% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.7) translateY(-20px);
                    }
                }
            `}</style>
        </div>
    );
};

export default ReviewModal;
