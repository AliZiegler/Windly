"use client";
import Stars from "@/app/components/global/ReactStars";
import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { urlString } from "@/app/components/global/Atoms";
import Link from "next/link";
import { addReview, updateReview } from "@/app/actions/ReviewActions";
import { z } from "zod";
import { CircleAlert, Eye } from "lucide-react";

type WriteReviewProps = {
    searchParams: { [key: string]: string | string[] | undefined };
    productId: number;
    userId: string;
    review?: {
        id: number;
        rating: number;
        review: string;
        createdAt: string;
        updatedAt: string;
    } | null | undefined;
    productName: string;
}

export default function WriteReview({
    searchParams,
    productId,
    userId,
    review,
    productName
}: WriteReviewProps) {
    const router = useRouter();
    const ReviewShown = searchParams.review;
    const isReviewShown = ReviewShown === "shown";
    const reviewRef = useRef<HTMLFormElement>(null);

    const didUserReview = !!review && typeof review.id === 'number';
    const reviewId = didUserReview ? review.id : undefined;

    const [rating, setRating] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (didUserReview && review) {
            setRating(review.rating);
        } else {
            setRating(0);
        }
    }, [didUserReview, review]);

    useEffect(() => {
        if (isReviewShown && reviewRef.current) {
            reviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [isReviewShown]);

    const ReviewSchema = z.object({
        rating: z.number().min(0.5, "Select at least half a star"),
        review: z.string().min(3, "Review is too short").max(1000, "Review is too long"),
    });

    async function handleAdd(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const rawRating = formData.get("rating");
        const rawReview = formData.get("review");

        const data = {
            rating: typeof rawRating === "string" ? Number(rawRating) : 0,
            review: typeof rawReview === "string" ? rawReview : "",
        };

        const parsed = ReviewSchema.safeParse(data);
        if (!parsed.success) {
            setError(
                parsed.error.issues
                    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                    .join("; ")
            );
            setLoading(false);
            return;
        }

        try {
            await addReview(
                productId,
                userId,
                parsed.data.rating,
                parsed.data.review
            );
            router.replace("?");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while adding the review.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (reviewId === undefined) {
            setError("Cannot update review: Review ID is missing.");
            setLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        const rawRating = formData.get("rating");
        const rawReview = formData.get("review");

        const dataToValidate = {
            rating: typeof rawRating === "string" && !isNaN(Number(rawRating)) ? Number(rawRating) : (review?.rating || 0),
            review: typeof rawReview === "string" ? rawReview : (review?.review || ""),
        };

        const parsed = ReviewSchema.safeParse(dataToValidate);
        if (!parsed.success) {
            setError(
                parsed.error.issues
                    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                    .join("; ")
            );
            setLoading(false);
            return;
        }

        try {
            await updateReview(
                parsed.data,
                reviewId,
                userId
            );
            router.replace("?");
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred while updating the review.");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleRatingChange(r: number) {
        setRating(r);
    }

    return (
        <>
            {isReviewShown && (
                <div className="max-w-4xl mx-auto">
                    <form
                        onSubmit={didUserReview ? handleUpdate : handleAdd}
                        ref={reviewRef}
                        className="bg-[#22272f] border border-gray-600/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">
                                {didUserReview ? "Update Your Review" : "Share Your Experience"}
                            </h2>
                            <p className="text-gray-400">
                                Help other customers by sharing your thoughts about this product
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="text-center space-y-3">
                                <label className="block text-lg font-semibold text-gray-200">
                                    How would you rate this product?
                                </label>
                                <div className="flex justify-center">
                                    <Stars
                                        value={rating}
                                        edit={true}
                                        count={5}
                                        size={45}
                                        onChange={handleRatingChange}
                                    />
                                </div>
                                {rating > 0 && (
                                    <div className="flex items-center justify-center gap-2 text-gray-300">
                                        <span className="text-2xl font-bold">{rating}</span>
                                        <span>out of 5 stars</span>
                                    </div>
                                )}
                            </div>
                            <input
                                name="rating"
                                type="number"
                                value={rating}
                                readOnly
                                className="sr-only"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label htmlFor="review-textarea" className="text-lg font-semibold text-gray-200">
                                    Write Your Review
                                </label>
                                <Link
                                    href={`/${urlString(productName)}/reviews`}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-1"
                                >
                                    <Eye className="w-4 h-4" />
                                    See All Reviews
                                </Link>
                            </div>

                            <div className="relative">
                                <textarea
                                    id="review-textarea"
                                    name="review"
                                    className="w-full h-40 px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 resize-y transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    defaultValue={didUserReview && review ? review.review : ""}
                                    placeholder="What did you like or dislike about this product? What should other customers know before purchasing?"
                                />
                                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                                    Max 1000 characters
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CircleAlert className="w-4 h-4" />
                                    <span className="text-red-300 font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200
                                    ${loading
                                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black hover:from-[#e0a000] hover:to-[#e08500] hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                                    }
                                `}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <span>Submitting...</span>
                                    </div>
                                ) : (
                                    didUserReview ? "Update Review" : "Submit Review"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
