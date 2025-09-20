"use client";

import { urlString, homeOnlySearchParams } from "@/app/components/global/Atoms";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchProps = {
    categories: string[];
    className?: string;
    placeholder?: string;
    onSearchChange?: (search: string, category: string) => void;
}

export default function SearchBar({
    categories,
    className = "",
    placeholder = "Search…",
    onSearchChange,
}: SearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ct = useMemo(() => ["All", ...(categories ?? [])], [categories]);

    const currentSearch = searchParams.get("search") ?? "";
    const currentCategory = searchParams.get("category") ?? "all";

    const [selectedCategory, setSelectedCategory] = useState(currentCategory);
    const [searchValue, setSearchValue] = useState(currentSearch);

    // Update local state when URL params change
    useEffect(() => {
        setSelectedCategory(currentCategory);
        setSearchValue(currentSearch);
    }, [currentCategory, currentSearch]);

    const handleCategoryChange = useCallback((value: string) => {
        setSelectedCategory(value);
    }, []);

    const handleSearch = useCallback(() => {
        if (searchValue === currentSearch && selectedCategory === currentCategory) return;

        const newParams = new URLSearchParams(searchParams);
        Array.from(newParams.keys()).forEach((key) => {
            if (!homeOnlySearchParams.includes(key)) {
                newParams.delete(key);
            }
        });

        if (searchValue.trim() !== "") {
            newParams.set("search", urlString(searchValue.trim()));
        } else {
            newParams.delete("search");
        }

        if (selectedCategory.toLowerCase() !== "all") {
            newParams.set("category", selectedCategory);
        } else {
            newParams.delete("category");
        }

        onSearchChange?.(searchValue.trim(), selectedCategory);
        router.push(`/?${newParams.toString()}`);
    }, [router, currentSearch, currentCategory, onSearchChange, selectedCategory, searchValue, searchParams]);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        handleSearch();
    }, [handleSearch]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    }, [handleSearch]);

    // Get the display label for the selected category
    const getDisplayLabel = useCallback((value: string) => {
        return ct.find((cat) => urlString(cat) === value) ??
            ct.find((cat) => cat.toLowerCase() === value.toLowerCase()) ??
            value;
    }, [ct]);

    return (
        <form onSubmit={handleSubmit} className={`flex items-center ${className}`} role="search" aria-label="Product search">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="min-h-[50px] w-auto min-w-[80px] md:min-h-[60px] bg-[#697565] hover:bg-[#4e5c5a] text-white font-bold 
                    rounded-l-md rounded-r-none border-r border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-xs 
                    sm:text-sm md:text-base">
                    <SelectValue>
                        {getDisplayLabel(selectedCategory)}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-midnight/80 text-white border-[#697565]">
                    {ct.map((category) => (
                        <SelectItem
                            key={category}
                            value={urlString(category)}
                            className="hover:bg-[#4e5c5a] focus:bg-[#4e5c5a]"
                        >
                            {category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                className="bg-[#F2F2F2] h-[50px] w-[200px] md:h-[60px] flex-1 md:flex-none 
                md:2xl:w-[900px] md:xl:w-[700px] md:lg:w-[500px] md:sm:w-[400px] md:w-72 
                text-black text-base md:text-lg px-3 md:px-4 border-y border-l-0 border-r-0 border-gray-300 
                rounded-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                placeholder={placeholder}
                aria-label="Search products"
                autoComplete="off"
                spellCheck="false"
            />

            <Button
                type="submit"
                className="bg-[#ECDFCC] hover:bg-[#E5D4B1] h-[50px] md:h-[60px] w-[50px] md:w-[60px] 
  rounded-l-none rounded-r-md border-l border-gray-300 focus:ring-2 focus:ring-blue-500 
  transition-all duration-200"
                aria-label="Search"
            >
                <Search className="w-2/3 h-2/3 text-black transition-transform duration-200 hover:scale-110" />
            </Button>
        </form>
    );
}
