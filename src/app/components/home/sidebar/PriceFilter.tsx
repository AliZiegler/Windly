"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams, ORIGINAL_MAX_PRICE } from "@/app/components/global/Atoms";

export default function PriceFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramsPrice: number = Number(
        searchParams.get("price") || ORIGINAL_MAX_PRICE,
    );
    const [maxPrice, setMaxPrice] = useState(paramsPrice);

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newPrice = e.target.valueAsNumber * 25;
        setMaxPrice(newPrice);
    }

    function handleMouseUp() {
        const newParams = maxPrice >= ORIGINAL_MAX_PRICE
            ? updateSearchParams(searchParams, "price", null)
            : updateSearchParams(searchParams, "price", maxPrice.toString());

        router.push(`?${newParams}`);
    }
    useEffect(() => {
        setMaxPrice(paramsPrice);
    }, [paramsPrice]);

    return (
        <section>
            <b>Price</b>
            <p>
                $0 - ${!maxPrice || maxPrice >= ORIGINAL_MAX_PRICE
                    ? `${ORIGINAL_MAX_PRICE}+`
                    : maxPrice}
            </p>
            <input
                type="range"
                className="w-44 h-3 cursor-pointer"
                value={maxPrice / 25}
                onChange={handlePriceChange}
                onPointerUp={handleMouseUp}
                min={1}
                max={ORIGINAL_MAX_PRICE / 25}
            />
        </section>
    );
}
