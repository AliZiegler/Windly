"use client";

import Image from "next/image";
import { updateSearchParams, urlString, CATEGORIES } from "@/app/components/global/Atoms";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface SearchProps {
    className?: string;
    placeholder?: string;
    onSearchChange?: (search: string, category: string) => void;
}

export default function Search({
    className = "",
    placeholder = "Search…",
    onSearchChange,
}: SearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("search") ?? "";
    const currentCategory = searchParams.get("category") ?? "all";

    const [selectedCategory, setSelectedCategory] = useState(currentCategory);
    const selectRef = useRef<HTMLSelectElement>(null);
    const sizerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!sizerRef.current || !selectRef.current) return;

        const label = CATEGORIES.find((cat) => urlString(cat) === selectedCategory) ?? selectedCategory;
        sizerRef.current.textContent = label;

        const measured = sizerRef.current.offsetWidth;
        selectRef.current.style.width = `${measured + 32}px`;
    }, [selectedCategory]);

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const search = (formData.get("search") ?? "").toString();
            const category = selectedCategory;

            if (search === currentSearch && category === currentCategory) return;

            let newParams = updateSearchParams(searchParams, "search", urlString(search));
            if (category !== "All") {
                newParams = updateSearchParams(newParams, "category", category);
            } else {
                newParams = updateSearchParams(newParams, "category", null);
            }

            onSearchChange?.(search, category);
            router.push(`/?${newParams}`);
        },
        [router, searchParams, currentSearch, currentCategory, onSearchChange, selectedCategory]
    );

    return (
        <form onSubmit={handleSubmit} className={`flex items-center w-[60%] ${className}`} role="search" aria-label="Product search">
            <div className="relative inline-block">
                <span
                    ref={sizerRef}
                    className="invisible absolute whitespace-nowrap text-white text-center h-[60px] px-4 text-base font-sans font-normal"
                />

                <select
                    ref={selectRef}
                    name="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Select category"
                    className="inline-block h-[60px] px-4 cursor-pointer bg-[#697565] text-white text-center rounded-l-md border-r
                    border-gray-300 font-bold focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                    {CATEGORIES.map((category) => (
                        <option key={category} value={urlString(category)}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <input
                name="search"
                defaultValue={currentSearch}
                type="text"
                className="bg-[#F2F2F2] h-[60px] 2xl:w-[900px] xl-w-[700px] lg:w-[500px] sm:w-[400px] w-72 text-black
                text-lg px-4 border-y border-gray-300 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={placeholder}
                aria-label="Search products"
                autoComplete="off"
                spellCheck="false"
            />

            <button
                type="submit"
                className="bg-[#ECDFCC] h-[60px] w-[60px] flex items-center justify-center rounded-r-md border-l
                border-gray-300 hover:bg-[#E5D4B1] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200 group"
                aria-label="Search"
            >
                <Image
                    src="/images/searchIcon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="cursor-pointer group-hover:scale-110 transition-transform duration-200 sm:w-[40px] sm:h-[40px] w-[30px] h-[30px]"
                    priority={false}
                />
            </button>
        </form>
    );
}
