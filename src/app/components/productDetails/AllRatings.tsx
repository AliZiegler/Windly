"use client";
import { Tooltip } from "react-tooltip";
import Stars from "@/app/components/global/ReactStars";
import Link from "next/link";


export default function AllRatings({ rating, url }: { rating: number; url: string }) {
    return (
        <span className="cursor-pointer">
            <Link href={url}
                data-tooltip-id="allRatings"
                data-tooltip-content="See All Reviews"
                data-tooltip-place="bottom"
            >
                <Stars
                    value={rating}
                    size={25}
                    edit={false}
                    className="cursor-pointer"
                />
            </Link>
            <Tooltip id="allRatings" />
        </span>
    );
}
