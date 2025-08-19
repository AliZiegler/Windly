"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { BadgePercent } from "lucide-react";

export default function DiscountFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramsDiscount: number = Number(
        searchParams.get("discount") || 0,
    );
    const [minDiscount, setMinDiscount] = useState(
        paramsDiscount,
    );
    function handleMouseUp() {
        const newParams = minDiscount
            ? updateSearchParams(searchParams, "discount", String(minDiscount))
            : updateSearchParams(searchParams, "discount", null);

        router.push(`?${newParams.toString()}`);
    }
    useEffect(() => {
        setMinDiscount(paramsDiscount);
    }, [paramsDiscount]);

    return (
        <section className="flex flex-col gap-2.5">
            <span className="flex gap-2 items-center">
                <b>Discount</b>
                <BadgePercent className="size-6 md:size-[20px]" strokeWidth={1.5} />
            </span>
            <p>{minDiscount}% - 100%</p>
            <input
                type="range"
                className="w-full h-3 cursor-pointer"
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.valueAsNumber)}
                onPointerUp={handleMouseUp}
                min={0}
                max={100}
            />
        </section>
    );
}
