"use client";
import Stars from "@/app/components/global/ReactStars";
import { useEffect, useRef } from "react";

export default function WriteReview({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const ReviewShown = searchParams.review;
    const isReviewShown = ReviewShown === "shown";
    const reviewRef = useRef<HTMLFormElement>(null);

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
                    ref={reviewRef}
                    className="bg-[#2a313c] h-[500px] w-6xl self-center mb-8 pl-8 pt-8 flex flex-col gap-4"
                >
                    <h1 className="text-3xl">Write Your Own Review</h1>
                    <Stars size={40} />
                    <b className="text-2xl">Review</b>
                    <textarea className="w-2xl h-40 border-2 border-gray-500 text-lg pl-2 pt-2"></textarea>
                    <button className="bg-[#ffb100] w-52 h-9 rounded-lg text-[#2a313c] mt-4">Submit Review</button>
                </form>
            )}
        </>
    );
}
