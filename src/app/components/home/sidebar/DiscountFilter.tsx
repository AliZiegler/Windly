"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";

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
            ? updateSearchParams(searchParams, "discount", minDiscount)
            : updateSearchParams(searchParams, "discount", null);

        router.push(`?${newParams}`);
    }
    useEffect(() => {
        setMinDiscount(paramsDiscount);
    }, [paramsDiscount]);

    return (
        <section>
            <b>Discount</b>
            <p>{minDiscount ? minDiscount : "0"}% - 100%</p>
            <input
                type="range"
                className="w-44 h-3 cursor-pointer"
                value={minDiscount}
                onChange={(e) => setMinDiscount(e.target.valueAsNumber)}
                onMouseUp={handleMouseUp}
                min={0}
                max={100}
            />
        </section>
    );
}
