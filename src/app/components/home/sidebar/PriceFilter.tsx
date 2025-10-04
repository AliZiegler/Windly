"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ORIGINAL_MAX_PRICE } from "@/app/components/global/Atoms";
import { BadgeDollarSign } from "lucide-react";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

export default function PriceFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paramsMinPrice: number = Number(searchParams.get("minPrice") || 0);
    const paramsMaxPrice: number = Number(searchParams.get("maxPrice") || ORIGINAL_MAX_PRICE);
    const [priceRange, setPriceRange] = useState<[number, number]>([paramsMinPrice / 25, paramsMaxPrice / 25]);

    function handlePriceChange(value: [number, number]) {
        setPriceRange(value);
    }

    function handleMouseUp() {
        const minPrice = priceRange[0] * 25;
        const maxPrice = priceRange[1] * 25;

        const params = new URLSearchParams(searchParams);

        if (minPrice <= 0) {
            params.delete("minPrice");
        } else {
            params.set("minPrice", minPrice.toString());
        }
        if (maxPrice >= ORIGINAL_MAX_PRICE) {
            params.delete("maxPrice");
        } else {
            params.set("maxPrice", maxPrice.toString());
        }

        router.push(`?${params.toString()}`);
    }

    useEffect(() => {
        setPriceRange([paramsMinPrice / 25, paramsMaxPrice / 25]);
    }, [paramsMinPrice, paramsMaxPrice]);

    return (
        <section className="flex flex-col gap-2.5">
            <span className="flex items-center gap-2">
                <b>Price</b>
                <BadgeDollarSign className="size-6 md:size-[20px]" strokeWidth={1.5} />
            </span>
            <p>
                ${priceRange[0] * 25} - ${priceRange[1] * 25 >= ORIGINAL_MAX_PRICE
                    ? `${ORIGINAL_MAX_PRICE}+`
                    : priceRange[1] * 25}
            </p>
            <RangeSlider
                className="w-full h-2 cursor-pointer"
                value={priceRange}
                onInput={handlePriceChange}
                onThumbDragEnd={handleMouseUp}
                min={0}
                max={ORIGINAL_MAX_PRICE / 25}
            />
        </section>
    );
}
