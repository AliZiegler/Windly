"use client";
import Stars from "@/app/components/global/ReactStars.tsx";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { UserStar } from "lucide-react";

export default function RatingFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rating = searchParams.get("rating") || 0;

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
            <span className="flex items-center gap-2">
                <b>Customer Reviews</b>
                <UserStar className="size-6 md:size-[20px]" strokeWidth={1.5} />
            </span>
            <span className="hidden md:block">
                <Stars
                    onChange={ratingChanged}
                    edit={true}
                    count={5}
                    size={45}
                    color2="#FFD700"
                    value={Number(rating)}
                />
            </span>

            <span className="hidden sm:block md:hidden">
                <Stars
                    onChange={ratingChanged}
                    edit={true}
                    count={5}
                    size={55}
                    color2="#FFD700"
                    value={Number(rating)}
                />
            </span>

            <span className="block sm:hidden min-w-[276px]">
                <Stars
                    onChange={ratingChanged}
                    edit={true}
                    count={5}
                    size={42}
                    color2="#FFD700"
                    value={Number(rating)}
                />
            </span>
        </section>
    );
}
