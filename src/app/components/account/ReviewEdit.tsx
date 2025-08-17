'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Stars from '@/app/components/global/ReactStars';
import { updateReview } from '@/app/actions/ReviewActions';
import { z } from 'zod';
import { Check, CircleAlert, X } from 'lucide-react';

const ReviewUpdateSchema = z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot be more than 5 stars'),
    review: z.string().trim().min(3, 'Review must be at least 3 characters long').max(1000, 'Review cannot exceed 1000 characters'),
    updatedAt: z.iso.datetime(),
});

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

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

    const formattedDate = formatDate(fReview.createdAt);
    const formattedUpdateDate = formatDate(fReview.updatedAt);
    const isUpdated = fReview.createdAt.getTime() !== fReview.updatedAt.getTime();

    const hasChanges = rating !== fReview.rating || review !== fReview.review;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges) {
            setError('No changes were made to the review.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        const formData = {
            rating,
            review: review.trim(),
            updatedAt: new Date().toISOString(),
        };

        try {
            const validatedData = ReviewUpdateSchema.parse(formData);

            const result = await updateReview(validatedData, fReview.id, userId);

            if (result?.success === false) {
                setError(result.error || 'Failed to update review');
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`?`);
                }, 1500);
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.message);
            } else {
                setError(`Failed to update review: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
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
            const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
            if (!confirmCancel) return;
        }
        router.push('?');
    };

    return (
        <div className="w-full mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="font-bold text-2xl sm:text-3xl text-white">Edit Review</h1>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <CircleAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                    <CircleAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Review updated successfully! Redirecting...</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-[#393e46] border-2 border-[#1c2129] rounded-lg overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <Link
                                href={`/${name}`}
                                className="block group overflow-hidden rounded-lg bg-white/5 aspect-square w-full max-w-[300px] mx-auto lg:mx-0 lg:w-[300px]"
                            >
                                <Image
                                    src="/images/placeholder.png"
                                    width={300}
                                    height={300}
                                    alt={`${productName} product image`}
                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 p-4"
                                />
                            </Link>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            <div>
                                <Link href={`/${name}`} className="group block">
                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-[#00CAFF] transition-colors duration-200 line-clamp-2">
                                        {productName}
                                    </h2>
                                </Link>
                                <p className="text-sm sm:text-base text-gray-300 leading-relaxed line-clamp-3">
                                    {fReview.description}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                                <span className="text-lg sm:text-xl font-medium text-white">Your Rating:</span>
                                <div className="flex items-center gap-2">
                                    <Stars
                                        value={rating}
                                        edit={true}
                                        count={5}
                                        size={28}
                                        onChange={handleRatingChange}
                                    />
                                    <span className="ml-2 text-lg font-medium text-[#00CAFF]">
                                        {rating}/5
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#1c2129]"></div>

                <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">Edit Your Review</h3>
                            <div className="text-sm text-gray-400">
                                <span>Originally submitted on {formattedDate}</span>
                                {isUpdated && (
                                    <span className="block sm:inline sm:ml-2 sm:before:content-['•'] sm:before:mx-2">
                                        Last updated on {formattedUpdateDate}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="inline-flex items-center cursor-pointer justify-center bg-gray-600 hover:bg-gray-700 text-white 
                                font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 
                                focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#393e46] active:scale-95 disabled:opacity-50 
                                disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || !hasChanges}
                                className={`inline-flex items-center justify-center font-medium px-4 py-2 rounded-lg transition-all duration-200 
                                            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#393e46] active:scale-95 
                                            disabled:hover:scale-100  ${hasChanges && !isSubmitting
                                        ? 'bg-green-600 hover:bg-green-700 cursor-pointer text-white focus:ring-green-500'
                                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <textarea
                            value={review}
                            onChange={handleReviewChange}
                            className="w-full h-32 sm:h-40 p-4 bg-[#2a2f38] border border-[#1c2129] rounded-lg text-white text-base leading-relaxed resize-vertical placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Share your thoughts about this product..."
                            maxLength={1000}
                            minLength={3}
                            required
                            disabled={isSubmitting}
                        />

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Minimum 3 characters required</span>
                            <span
                                className={`font-medium ${review.length > 950
                                    ? 'text-yellow-400'
                                    : review.length > 900
                                        ? 'text-yellow-500'
                                        : 'text-gray-400'
                                    }`}
                            >
                                {review.length}/1000 characters
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
