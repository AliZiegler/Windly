'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Stars from "@/app/components/global/ReactStars";
import { updateReview } from "@/app/actions/UserActions";

type ReviewEditProps = {
    productName: string;
    name: string;
    fReview: {
        id: number;
        rating: number;
        review: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
    };
    userId: string;
};

export default function ReviewEdit({ productName, name, fReview, userId }: ReviewEditProps) {
    const router = useRouter();
    const [rating, setRating] = useState(fReview.rating);
    const [review, setReview] = useState(fReview.review);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const isUpdated = fReview.updatedAt !== fReview.createdAt;

    const date = new Date(fReview.createdAt);
    const updateDate = new Date(fReview.updatedAt);
    const formattedDate = date.toLocaleString();
    const formattedUpdateDate = updateDate.toLocaleString();

    const hasChanges = rating !== fReview.rating || review !== fReview.review;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges) {
            setError("No changes were made to the review.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setError("Rating must be between 1 and 5 stars.");
            return;
        }

        if (review.trim().length < 3) {
            setError("Review must be at least 3 characters long.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const data = {
                rating,
                review: review.trim(),
                updatedAt: new Date().toISOString()
            };

            const result = await updateReview(data, fReview.id, userId);

            if (result?.success === false) {
                setError(result.error || "Failed to update review");
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`?`);
                }, 1500);
            }
        } catch (err) {
            setError(`Failed to update review: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRatingChange = (newRating: number) => {
        setRating(newRating);
        setError(null);
    };

    const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReview(e.target.value);
        setError(null);
    };

    const handleCancel = () => {
        if (hasChanges) {
            const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
            if (!confirmCancel) return;
        }
        router.push("?");
    };

    return (
        <form className="w-full flex flex-col gap-3 pr-4" onSubmit={handleSubmit}>
            <div className="w-full flex flex-col gap-3 pr-4">
                <h1 className="font-bold text-xl">Edit Review</h1>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded mb-3">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500 text-white p-3 rounded mb-3">
                        Review updated successfully! Redirecting...
                    </div>
                )}

                <span className="flex flex-col gap-3 w-full border-2 bg-[#393e46] border-[#1c2129] p-5">
                    <span className="flex gap-3 mb-5">
                        <Link href={`/${name}`} className="cursor-pointer">
                            <Image
                                src="/images/placeholder.png"
                                width={350}
                                height={350}
                                alt="Product Image"
                                className="w-[473px] h-[350px] object-cover"
                            />
                        </Link>
                        <span className="flex flex-col gap-7 w-full h-[350px] pt-10 pl-5">
                            <span>
                                <Link href={`/${name}`} className="cursor-pointer hover:text-[#00CAFF] duration-200">
                                    <h2 className="text-3xl font-bold mb-0.5">{productName}</h2>
                                </Link>
                                <b className="text-md font-light text-gray-300">{fReview.description}</b>
                            </span>
                            <span className="flex gap-5">
                                <b className="text-xl font-light mt-2.5">Your Rating:</b>
                                <Stars
                                    value={rating}
                                    edit={true}
                                    count={5}
                                    size={30}
                                    onChange={handleRatingChange}
                                />
                            </span>
                        </span>
                    </span>

                    <span className="flex justify-between items-center">
                        <p>Your Review (submitted on {formattedDate} {isUpdated && `,updated on ${formattedUpdateDate}`})</p>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || !hasChanges}
                                className={`block px-4 py-1 rounded-lg font-bold text-white cursor-pointer transition-opacity ${hasChanges
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="block bg-gray-500 hover:bg-gray-600 px-4 py-1 rounded-lg font-bold text-white
                                cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </span>

                    <textarea
                        value={review}
                        onChange={handleReviewChange}
                        className="text-lg font-light w-full h-32 p-3 border-1 border-[#1c2129] bg-[#2a2f37] text-white
                        resize-vertical rounded focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent"
                        placeholder="Write your review..."
                        maxLength={1000}
                        minLength={3}
                        required
                        disabled={isSubmitting}
                    />

                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>Minimum 3 characters required</span>
                        <span className={review.length > 950 ? 'text-yellow-500' : ''}>
                            {review.length}/1000 characters
                        </span>
                    </div>
                </span>
            </div>
        </form>
    );
}
