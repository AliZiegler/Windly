"use client";
import Stars from "@/app/components/global/ReactStars";
import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addReview } from "@/app/actions/UserActions";
import { z } from "zod";

export default function WriteReview({
    searchParams,
    productId,
    userId,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
    productId: number;
    userId: string;
}) {
    const router = useRouter();
    const ReviewShown = searchParams.review;
    const isReviewShown = ReviewShown === "shown";
    const reviewRef = useRef<HTMLFormElement>(null);

    const [rating, setRating] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const ReviewSchema = z.object({
        rating: z.number().min(0.5, "Select at least half a star"),
        review: z.string().min(3, "Too short").max(1000, "Too long"),
    });

    useEffect(() => {
        if (isReviewShown && reviewRef.current) {
            reviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [isReviewShown]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
            router.refresh();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
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
                    onSubmit={handleSubmit}
                    ref={reviewRef}
                    className="bg-[#2a313c] h-[500px] w-6xl self-center mb-8 pl-8 pt-8 flex flex-col gap-4"
                >
                    <h1 className="text-3xl">Write Your Own Review</h1>

                    <Stars size={40} onChange={handleRatingChange} />
                    <input
                        name="rating"
                        type="number"
                        value={rating}
                        readOnly
                        className="invisible h-0 w-0"
                    />

                    <b className="text-2xl">Review</b>
                    <textarea
                        name="review"
                        className="w-2xl h-40 border-2 border-gray-500 text-lg pl-2 pt-2"
                    />

                    {error && <div className="text-red-400">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-[#ffb100] w-52 h-9 rounded-lg text-[#2a313c] mt-4 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                            }`}
                    >
                        {loading ? "Submitting…" : "Submit Review"}
                    </button>
                </form>
            )}
        </>
    );
}
