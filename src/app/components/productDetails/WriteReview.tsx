"use client";
import Stars from "@/app/components/global/ReactStars";
import { useEffect, useRef, useState } from "react";
import { addReview } from "@/app/actions/UserActions";
import { z } from "zod";

export default function WriteReview(
    { searchParams, productId, userId }:
        { searchParams: { [key: string]: string | string[] | undefined }, productId: number, userId: string }
) {
    const ReviewShown = searchParams.review;
    const isReviewShown = ReviewShown === "shown";
    const reviewRef = useRef<HTMLFormElement>(null);
    const [rating, setRating] = useState(0);
    const ReviewSchema = z.object({
        rating: z.number().min(0.5).max(5),
        review: z.string().min(10).max(1000),
    })
    async function SubmitReview(formData: FormData) {
        const review = formData.get("review");
        const rating = formData.get("rating");
        if (review && rating) {
            const parsedReview = ReviewSchema.safeParse({
                rating: Number(rating),
                review: review as string,
            });
            if (parsedReview.success) {
                await addReview(productId, userId, parsedReview.data.rating, parsedReview.data.review);
            } if (parsedReview.error) {
                console.error(parsedReview.error);
            }
        }
    }
    function handleRatingChange(rating: number) {
        setRating(rating);
    }

    useEffect(() => {
        if (isReviewShown && reviewRef.current) {
            reviewRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [isReviewShown]);

    return (
        <>
            {isReviewShown && (
                <form
                    action={SubmitReview}
                    ref={reviewRef}
                    className="bg-[#2a313c] h-[500px] w-6xl self-center mb-8 pl-8 pt-8 flex flex-col gap-4"
                >
                    <h1 className="text-3xl">Write Your Own Review</h1>
                    <Stars size={40} onChange={handleRatingChange} />
                    <input name="rating" type="number" value={rating} readOnly className="invisible h-0 w-0" />
                    <b className="text-2xl">Review</b>
                    <textarea name="review" className="w-2xl h-40 border-2 border-gray-500 text-lg pl-2 pt-2"></textarea>
                    <button className="bg-[#ffb100] w-52 h-9 rounded-lg text-[#2a313c] mt-4">Submit Review</button>
                </form>
            )}
        </>
    );
}
