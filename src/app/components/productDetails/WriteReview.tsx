"use client";
import Stars from "@/app/components/global/ReactStars";
import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addReview, updateReview } from "@/app/actions/UserActions"; // Assuming these are server actions
import { z } from "zod";

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
}

export default function WriteReview({
    searchParams,
    productId,
    userId,
    review
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
    }, [didUserReview, review?.rating, review]);

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
                <form
                    onSubmit={didUserReview ? handleUpdate : handleAdd}
                    ref={reviewRef}
                    className="bg-[#2a313c] p-8 flex flex-col gap-4 rounded-lg shadow-lg mx-auto my-8 max-w-3xl w-full"
                >
                    <h1 className="text-3xl text-white font-semibold mb-4">
                        {didUserReview ? "Update Your Review" : "Write Your Own Review"}
                    </h1>

                    <Stars
                        value={rating}
                        edit={true}
                        count={5}
                        size={40}
                        onChange={handleRatingChange}
                    />
                    <input
                        name="rating"
                        type="number"
                        value={rating}
                        readOnly
                        className="sr-only"
                    />

                    <label htmlFor="review-textarea" className="text-2xl text-white font-medium mt-4">Review</label>
                    <textarea
                        id="review-textarea"
                        name="review"
                        className="w-full h-40 border-2 border-gray-500 text-lg p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:border-blue-500 resize-y"
                        defaultValue={didUserReview && review ? review.review : ""}
                        placeholder="Share your thoughts about the product..."
                    />

                    {error && <div className="text-red-400 mt-2">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-[#ffb100] h-12 rounded-lg text-[#2a313c] font-bold text-lg mt-6 transition-colors duration-200
                            ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#e0a000] cursor-pointer"
                            }`}
                    >
                        {loading ? "Submitting…" : (didUserReview ? "Update Review" : "Submit Review")}
                    </button>
                </form>
            )}
        </>
    );
}
