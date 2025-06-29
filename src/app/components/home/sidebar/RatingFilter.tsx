"use client";
import Stars from "@/app/components/global/ReactStars.tsx";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";

export default function RatingFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rating = searchParams.get("rating") || 0;
    function ratingChanged(r: number): void {
        if (r !== rating) {
            router.push(
                `?${updateSearchParams(
                    searchParams,
                    "rating",
                    r.toString(),
                )
                }`,
            );
        } else {
            router.push(`?${updateSearchParams(searchParams, "rating", "")}`);
        }
    }

    return (
        <section>
            <b>Customer Reviews</b>
            <Stars
                onChange={ratingChanged}
                edit={true}
                count={5}
                size={40}
                color2="#FFD700"
                value={rating}
            />
        </section>
    );
}
