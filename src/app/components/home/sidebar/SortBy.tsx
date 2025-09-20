"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { ArrowDownUp, ArrowDownAZ } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type SortOption = "relevance" | "price" | "discount" | "rating";

interface SortConfig {
    value: SortOption;
    label: string;
}

const SORT_OPTIONS: SortConfig[] = [
    { value: "relevance", label: "Relevance" },
    { value: "price", label: "Price" },
    { value: "discount", label: "Discount" },
    { value: "rating", label: "Rating" },
];

export default function SortBy() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Memoized values to prevent unnecessary re-renders
    const sort = useMemo(() =>
        (searchParams.get("sort") as SortOption) || "relevance",
        [searchParams]
    );

    const isReversed = useMemo(() =>
        searchParams.get("reverse") === "true",
        [searchParams]
    );

    // Memoized navigation function to prevent recreation on every render
    const navigateToUrl = useCallback((params: URLSearchParams) => {
        router.push(`?${params.toString()}`);
    }, [router]);

    const changeSort = useCallback((value: SortOption) => {
        const newSort = value === "relevance" ? null : value;
        const newParams = updateSearchParams(searchParams, "sort", newSort);
        navigateToUrl(newParams);
    }, [searchParams, navigateToUrl]);

    const toggleReverse = useCallback(() => {
        const newReverse = isReversed ? null : "true";
        const newParams = updateSearchParams(searchParams, "reverse", newReverse);
        navigateToUrl(newParams);
    }, [searchParams, isReversed, navigateToUrl]);

    return (
        <section className="flex flex-col gap-2.5" role="region" aria-label="Sort options">
            <span className="flex items-center gap-2">
                <b>Sort By</b>
                <ArrowDownAZ
                    className="size-6 md:size-[20px]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                />
            </span>

            <div className="flex justify-center">
                <Select value={sort} onValueChange={changeSort}>
                    <SelectTrigger
                        className="w-full h-9 bg-[#697565] hover:bg-[#4e5c5a] duration-200 hover:font-bold rounded-l-md rounded-r-none cursor-pointer text-left pl-3"
                        aria-label="Select sort criteria"
                    >
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#697565] text-white">
                        {SORT_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    onClick={toggleReverse}
                    className="group bg-[#FEBA17] rounded-l-none h-9 w-14 rounded-r-md flex items-center hover:bg-[#e3a001] cursor-pointer justify-center"
                    aria-label={`Sort in ${isReversed ? 'ascending' : 'descending'} order`}
                    title={`Currently sorting ${isReversed ? 'descending' : 'ascending'} - click to reverse`}
                >
                    <ArrowDownUp
                        size={25}
                        color="black"
                        className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isReversed ? 'rotate-180' : ''
                            }`}
                        aria-hidden="true"
                    />
                </Button>
            </div>
        </section>
    );
}
