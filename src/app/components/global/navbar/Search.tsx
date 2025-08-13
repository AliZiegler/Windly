"use client";

import Image from "next/image";
import { urlString, CATEGORIES, homeOnlySearchParams } from "@/app/components/global/Atoms";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

type SearchProps = {
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

            const newParams = new URLSearchParams(searchParams);
            Array.from(newParams.keys()).forEach((key) => {
                if (!homeOnlySearchParams.includes(key)) {
                    newParams.delete(key);
                }
            });
            if (search !== "") {
                newParams.set("search", urlString(search));
            } else {
                newParams.delete("search");
            }

            if (category.toLowerCase() !== "all") {
                newParams.set("category", category);
            } else {
                newParams.delete("category");
            }

            onSearchChange?.(search, category);
            router.push(`/?${newParams.toString()}`);
        },
        [router, currentSearch, currentCategory, onSearchChange, selectedCategory, searchParams]
    );

    return (
        <form onSubmit={handleSubmit} className={`flex items-center ${className}`} role="search" aria-label="Product search">
            <div className="relative inline-block">
                <span
                    ref={sizerRef}
                    className="invisible absolute whitespace-nowrap text-white text-center h-[50px] md:h-[60px] px-3 md:px-4 text-sm md:text-base font-sans font-normal"
                />

                <select
                    ref={selectRef}
                    name="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Select category"
                    className="inline-block h-[50px] w-[60px] sm:w-[82px] md:h-[60px] px-2 md:px-4 cursor-pointer bg-[#697565]
                    text-white text-center rounded-l-md border-r
                    border-gray-300 font-bold focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm md:text-base"
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
                className="bg-[#F2F2F2] h-[50px] w-[200px] md:h-[60px] flex-1 md:flex-none 
                md:2xl:w-[900px] md:xl:w-[700px] md:lg:w-[500px] md:sm:w-[400px] md:w-72 
                text-black text-base md:text-lg px-3 md:px-4 border-y border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200"
                placeholder={placeholder}
                aria-label="Search products"
                autoComplete="off"
                spellCheck="false"
            />

            <button
                type="submit"
                className="bg-[#ECDFCC] h-[50px] md:h-[60px] w-[50px] md:w-[60px] flex items-center justify-center rounded-r-md border-l
                border-gray-300 hover:bg-[#E5D4B1] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200 group"
                aria-label="Search"
            >
                <Image
                    src="/images/searchIcon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="cursor-pointer group-hover:scale-110 transition-transform duration-200 w-[25px] h-[25px] md:w-[40px] md:h-[40px]"
                    priority={false}
                />
            </button>
        </form>
    );
}
