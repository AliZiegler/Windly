"use client";

import Stars from "@/app/components/global/ReactStars.tsx";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { useState, useEffect } from "react";

export default function RatingFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rating = searchParams.get("rating") || 0;

    const [starSize, setStarSize] = useState(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            return 55;
        }
        return 43;
    });

    useEffect(() => {
        function handleResize() {
            setStarSize(window.innerWidth < 768 ? 55 : 43);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function ratingChanged(r: number): void {
        if (r !== Number(rating) && r !== 0.5) {
            router.push(
                `?${updateSearchParams(searchParams, "rating", r.toString()).toString()}`
            );
        } else {
            router.push(
                `?${updateSearchParams(searchParams, "rating", "").toString()}`
            );
        }
    }

    return (
        <section>
            <b>Customer Reviews</b>
            <Stars
                onChange={ratingChanged}
                edit={true}
                count={5}
                size={starSize}
                color2="#FFD700"
                value={Number(rating)}
            />
        </section>
    );
}
