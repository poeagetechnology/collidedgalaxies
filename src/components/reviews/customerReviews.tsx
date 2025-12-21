'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Albert_Sans } from 'next/font/google';
import { X } from "lucide-react";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    deleteDoc,
    doc,
    updateDoc
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/src/context/authProvider";
import ReviewModal from "@/src/components/forms/reviewModal";
import { limit, startAfter } from "firebase/firestore";

const albertSans = Albert_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

interface Review {
    id: string;
    rating: number;
    title: string;
    content: string;
    author: string;
    photos?: string[];
    createdAt: Timestamp | Date;
    userId?: string;
    verified?: boolean;
}

interface ReviewFormData {
    rating: number;
    title: string;
    content: string;
    author: string;
    photos: string[];
}

interface CustomerReviewsProps {
    productId: string;
}

export default function CustomerReviews({ productId }: CustomerReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortFilter, setSortFilter] = useState("Most Recent");
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // UPDATED TYPE: editingReview must be ReviewFormData
    const [editingReview, setEditingReview] = useState<ReviewFormData | null>(null);

    // Fetch reviews on mount
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setIsLoading(true);

                const q = query(
                    collection(db, "reviews"),
                    where("productId", "==", productId),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );

                const querySnapshot = await getDocs(q);

                if (querySnapshot.docs.length < 10) setHasMore(false);

                const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
                setLastDoc(lastVisible);

                const fetchedReviews: Review[] = [];
                querySnapshot.forEach((docItem) => {
                    fetchedReviews.push({
                        id: docItem.id,
                        ...docItem.data(),
                    } as Review);
                });

                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setReviews([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, [productId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (
                showSortDropdown &&
                sortDropdownRef.current &&
                !sortDropdownRef.current.contains(event.target as Node)
            ) {
                setShowSortDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showSortDropdown]);

    const handleSubmitReview = async (formData: ReviewFormData) => {
        if (!user) {
            throw new Error('You must be signed in to submit a review');
        }

        setIsSubmitting(true);

        try {
            // EDIT MODE
            if (editingReview) {
                const reviewToEdit = reviews.find((r) => r.author === editingReview.author);

                if (reviewToEdit) {
                    await updateDoc(doc(db, "reviews", reviewToEdit.id), {
                        rating: formData.rating,
                        title: formData.title,
                        content: formData.content,
                        photos: formData.photos,
                        author: formData.author,
                        updatedAt: Timestamp.now(),
                    });

                    // update local
                    setReviews(reviews.map(r =>
                        r.id === reviewToEdit.id ? { ...r, ...formData } : r
                    ));

                    // update user's review subcollection
                    const userReviewsQuery = query(
                        collection(db, "users", user.uid, "userReviews"),
                        where("reviewId", "==", reviewToEdit.id)
                    );
                    const snap = await getDocs(userReviewsQuery);

                    for (const d of snap.docs) {
                        await updateDoc(
                            doc(db, "users", user.uid, "userReviews", d.id),
                            {
                                ...formData,
                                updatedAt: Timestamp.now()
                            }
                        );
                    }
                }

                setEditingReview(null);
                setShowWriteReview(false);
                return;
            }

            // ADD MODE
            const reviewData = {
                productId,
                rating: formData.rating,
                title: formData.title,
                content: formData.content,
                author: formData.author,
                photos: formData.photos,
                userId: user.uid,
                createdAt: Timestamp.now(),
                verified: true,
            };

            const docRef = await addDoc(collection(db, "reviews"), reviewData);

            await addDoc(collection(db, "users", user.uid, "userReviews"), {
                ...reviewData,
                reviewId: docRef.id,
            });

            setReviews([
                { id: docRef.id, ...reviewData } as Review,
                ...reviews,
            ]);

            setShowWriteReview(false);
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: string, userId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await deleteDoc(doc(db, "reviews", reviewId));

            const userReviewsQuery = query(
                collection(db, "users", userId, "userReviews"),
                where("reviewId", "==", reviewId)
            );
            const userReviewsSnapshot = await getDocs(userReviewsQuery);

            await Promise.all(
                userReviewsSnapshot.docs.map((document) =>
                    deleteDoc(doc(db, "users", userId, "userReviews", document.id))
                )
            );

            setReviews(reviews.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review. Please try again.');
        }
    };

    const loadMoreReviews = async () => {
        if (!lastDoc || !hasMore) return;

        const nextQuery = query(
            collection(db, "reviews"),
            where("productId", "==", productId),
            orderBy("createdAt", "desc"),
            startAfter(lastDoc),
            limit(10)
        );

        const nextSnap = await getDocs(nextQuery);

        if (nextSnap.docs.length < 10) setHasMore(false);

        const lastVisible = nextSnap.docs[nextSnap.docs.length - 1];
        setLastDoc(lastVisible);

        const more: Review[] = [];
        nextSnap.forEach((docItem) => {
            more.push({
                id: docItem.id,
                ...docItem.data(),
            } as Review);
        });

        setReviews((prev) => [...prev, ...more]);
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((r) => r.rating === rating).length,
    }));

    const renderStars = (rating: number, size: number = 20) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Image
                key={i}
                src="/starIcon.svg"
                alt="star"
                width={size}
                height={size}
                className={`inline-block ${size === 20 ? 'w-5 h-5' : 'w-4 h-4'} ${i < rating ? 'opacity-100' : 'opacity-30'
                    }`}
            />
        ));
    };

    const formatDate = (date: Timestamp | Date) => {
        if (date instanceof Timestamp) {
            return date.toDate().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const filteredReviews = [...reviews]
        .filter((r) => {
            if (sortFilter === "With Photos") return r.photos && r.photos.length > 0;
            return true;
        })
        .sort((a, b) => {
            switch (sortFilter) {
                case "Highest Rating":
                    return b.rating - a.rating;
                case "Lowest Rating":
                    return a.rating - b.rating;
                case "Most Recent":
                    return (
                        (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) -
                        (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime())
                    );
                default:
                    return 0;
            }
        });

    return (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white ${albertSans.className}`}>
            <div className="flex w-full items-center justify-between mb-4">
                <h2 className="text-3xl md:text-4xl text-center md:text-left font-semibold">Customer Reviews</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-10 py-6">
                <div className="min-w-[250px] flex flex-col md:flex-row gap-3 md:gap-10">
                    <div className="flex flex-col md:flex-row w-full gap-12 mb-10">
                        <div className="flex-1 min-w-0">
                            <div className="mb-6">
                                <div className="text-5xl font-bold mb-2">{averageRating}</div>
                                <div className="flex gap-1 mb-2">{renderStars(Math.round(Number(averageRating)))}</div>
                                <div className="text-gray-600 text-sm">Based on {reviews.length} reviews</div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {ratingDistribution.map(({ rating, count }) => {
                                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={rating} className="flex items-center gap-3">
                                            <div className="flex gap-1 min-w-fit">
                                                {Array.from({ length: rating }).map((_, i) => (
                                                    <Image
                                                        key={i}
                                                        src="/starIcon.svg"
                                                        alt="star"
                                                        width={16}
                                                        height={16}
                                                        className="w-4 h-4"
                                                    />
                                                ))}
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gray-900 transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="text-gray-600 text-sm min-w-fit">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="border-b md:border-r border-gray-300" />
                </div>

                <div className="w-full">
                    <div className="flex justify-between pb-4 border-b border-gray-300 mb-12 items-center">
                        <div className="relative" ref={sortDropdownRef}>
                            <button
                                type="button"
                                className="flex items-center cursor-pointer space-x-2 text-gray-700 text-base hover:text-black"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSortDropdown(val => !val);
                                }}
                            >
                                <Image
                                    src="/sortIcon.svg"
                                    alt="Sort"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                />
                                <span>
                                    Sort by <span className="font-semibold">{sortFilter}</span>
                                </span>
                            </button>
                            {showSortDropdown && (
                                <div
                                    className="absolute left-0 mt-2 w-48 bg-white shadow-lg border z-30"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <ul>
                                        <li
                                            onClick={() => { setSortFilter('Most Recent'); setShowSortDropdown(false); }}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-base"
                                        >
                                            Most Recent
                                        </li>
                                        <li
                                            onClick={() => { setSortFilter('Highest Rating'); setShowSortDropdown(false); }}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-base"
                                        >
                                            Highest Rating
                                        </li>
                                        <li
                                            onClick={() => { setSortFilter('Lowest Rating'); setShowSortDropdown(false); }}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-base"
                                        >
                                            Lowest Rating
                                        </li>
                                        <li
                                            onClick={() => { setSortFilter('With Photos'); setShowSortDropdown(false); }}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-base"
                                        >
                                            With Photos
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex">
                            <button
                                onClick={() => {
                                    if (!user) {
                                        alert('Please sign in to write a review');
                                        return;
                                    }
                                    setEditingReview(null);
                                    setShowWriteReview(true);
                                }}
                                className="px-4 py-2 cursor-pointer text-sm bg-black text-white font-medium hover:bg-gray-800 transition-colors"
                            >
                                Write a Review
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-600 w-full">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-8 w-full">
                            {filteredReviews.slice(0, reviews.length).map((review) => (
                                <div key={review.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex gap-1 mb-2">{renderStars(review.rating)}</div>
                                            <h3 className="font-semibold text-lg mb-1">{review.title}</h3>
                                            <div className="text-sm text-gray-600">
                                                {review.author}
                                                {review.verified && (
                                                    <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium rounded">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {user && user.uid === review.userId && (
                                            <div className="flex gap-3">

                                                {/* EDIT BUTTON */}
                                                <button
                                                    onClick={() => {
                                                        setEditingReview({
                                                            rating: review.rating,
                                                            title: review.title,
                                                            content: review.content,
                                                            author: review.author,
                                                            photos: review.photos || [],
                                                        });
                                                        setShowWriteReview(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>

                                                {/* DELETE BUTTON */}
                                                <button
                                                    onClick={() => handleDeleteReview(review.id, review.userId!)}
                                                    className="text-red-600 hover:text-red-800 cursor-pointer text-sm font-medium transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

                                    {review.photos && review.photos.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex gap-3 flex-wrap">
                                                {review.photos.map((photo, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedPhoto(photo)}
                                                        className="relative w-20 h-20 bg-gray-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                                                    >
                                                        <Image
                                                            src={photo}
                                                            alt={`Review photo ${idx + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500">
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            ))}
                            {hasMore && reviews.length >= 10 && (
                                <div className="text-center my-2">
                                    <button
                                        onClick={loadMoreReviews}
                                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm cursor-pointer"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center w-full py-12 text-gray-600">
                            No reviews yet. Be the first to review this product!
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            <ReviewModal
                isOpen={showWriteReview}
                onClose={() => {
                    setShowWriteReview(false);
                    setEditingReview(null);
                }}
                onSubmit={handleSubmitReview}
                isSubmitting={isSubmitting}
                initialData={editingReview}
            />

            {/* Photo Zoom Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 cursor-pointer bg-white border p-2 hover:bg-gray-100 transition-colors shadow-md z-10"
                        type="button"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    <div
                        className="relative w-fit mx-auto flex justify-center items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={selectedPhoto}
                            alt="Zoomed review photo"
                            width={300}
                            height={300}
                            className="w-72 h-72 object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}