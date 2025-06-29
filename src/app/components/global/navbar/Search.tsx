"use client";

import Image from "next/image";
import { updateSearchParams, urlString } from "@/app/components/global/Atoms";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { CATEGORIES } from "@/app/components/global/Products";


type SearchProps = {
    className?: string;
    placeholder?: string;
    onSearchChange?: (search: string, category: string) => void;
}

export default function Search({
    className = "",
    placeholder = "Search…",
    onSearchChange
}: SearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = useMemo(() =>
        searchParams.get("search") ?? "",
        [searchParams]
    );

    const currentCategory = useMemo(() =>
        searchParams.get("category") ?? "all",
        [searchParams]
    );

    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const search = (formData.get("search") ?? "").toString();
        const category = (formData.get("category") ?? "").toString().toLowerCase();

        if (search === currentSearch && category === currentCategory) {
            return;
        }

        let newParams = updateSearchParams(searchParams, "search", search);

        if (category !== "all") {
            newParams = updateSearchParams(newParams, "category", category);
        } else { newParams = updateSearchParams(newParams, "category", null); }

        onSearchChange?.(search, category);

        router.push(`/?${newParams}`);
    }, [router, searchParams, currentSearch, currentCategory, onSearchChange]);

    const categoryOptions = useMemo(() =>
        CATEGORIES.map((category) => (
            <option key={category} value={urlString(category)}>
                {category}
            </option>
        )),
        []
    );

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex items-center ${className}`}
            role="search"
            aria-label="Product search"
        >
            <select
                name="category"
                defaultValue={currentCategory}
                className="w-25 h-[60px] cursor-pointer bg-[#697565] text-white text-center rounded-l-md border-r border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                aria-label="Select category"
            >
                {categoryOptions}
            </select>

            <input
                name="search"
                defaultValue={currentSearch}
                type="text"
                className="bg-[#F2F2F2] h-[60px] w-[900px] text-black text-lg px-4 border-y border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={placeholder}
                aria-label="Search products"
                autoComplete="off"
                spellCheck="false"
            />

            <button
                type="submit"
                className="bg-[#ECDFCC] h-[60px] w-[60px] flex items-center justify-center rounded-r-md
                border-l border-gray-300 hover:bg-[#E5D4B1] focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent transition-all duration-200 group"
                aria-label="Search"
            >
                <Image
                    src="/images/searchIcon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="cursor-pointer group-hover:scale-110 transition-transform duration-200"
                    priority={false}
                />
            </button>
        </form>
    );
}
