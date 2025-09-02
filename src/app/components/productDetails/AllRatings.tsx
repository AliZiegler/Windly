"use client";
import { Tooltip } from "react-tooltip";
import Stars from "@/app/components/global/ReactStars";
import Link from "next/link";


export default function AllRatings({ rating, url, size = 25, prefetch }: { rating: number; url: string, size?: number, prefetch?: boolean }) {
    return (
        <span className="cursor-pointer">
            <Link href={url}
                data-tooltip-id="allRatings"
                data-tooltip-content="See All Reviews"
                data-tooltip-place="bottom"
                className="flex gap-1 items-start"
                prefetch={prefetch}
            >
                <Stars
                    value={rating}
                    size={size}
                    edit={false}
                    className="cursor-pointer"
                />
                <b className="text-lg">⌄</b>
            </Link>
            <Tooltip id="allRatings" />
        </span>
    );
}
