"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/components/home/sidebar/Sidebar";

export default function MobileSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const sort = searchParams.get("sort") ?? "relevance";
    const reverse = searchParams.get("reverse") ?? "false";

    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const updateQueryParam = useCallback(
        (key: string, value: string | null) => {
            const newSearchParams = updateSearchParams(searchParams, key, value);
            router.push(`?${newSearchParams}`);
        },
        [router, searchParams]
    );

    const handleSortChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newSort = e.target.value === "relevance" ? null : e.target.value;
            updateQueryParam("sort", newSort);
        },
        [updateQueryParam]
    );

    const handleReverseToggle = useCallback(() => {
        const next = reverse === "false" ? "true" : null;
        updateQueryParam("reverse", next);
    }, [reverse, updateQueryParam]);

    const openSidebar = () => {
        setIsOpen(true);
        requestAnimationFrame(() => setIsClosing(false));
    };

    const closeSidebar = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => setIsOpen(false), 300);
    }, []);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                closeSidebar();
            }
        };

        document.addEventListener("keydown", handleEscapeKey);
        return () => document.removeEventListener("keydown", handleEscapeKey);
    }, [isOpen, closeSidebar]);

    return (
        <>
            <div className="w-full h-14 bg-[#393e46] flex items-center justify-between px-4 border-t border-[#272D36]">
                <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm">Sort:</span>
                    <div className="flex items-center gap-1">
                        <select
                            value={sort}
                            onChange={handleSortChange}
                            className="h-8 bg-[#697565] text-white text-sm px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price">Price</option>
                            <option value="discount">Discount</option>
                            <option value="rating">Rating</option>
                        </select>
                        <button
                            onClick={handleReverseToggle}
                            className="bg-[#FEBA17] h-8 w-8 flex items-center justify-center rounded hover:bg-[#e3a001] transition-colors duration-200"
                            aria-label={
                                reverse === "true" ? "Sort ascending" : "Sort descending"
                            }
                            title={
                                reverse === "true" ? "Sort ascending" : "Sort descending"
                            }
                        >
                            <Image
                                src="/images/reverseIcon.png"
                                alt="Reverse sort order"
                                width={16}
                                height={16}
                                className={`transition-transform duration-200 ${reverse === "true" ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                    </div>
                </div>
                <button
                    onClick={openSidebar}
                    className="px-4 py-2 bg-[#697565] text-white font-semibold text-sm rounded hover:bg-[#5a6358] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Filter
                </button>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex justify-start"
                    onClick={closeSidebar}
                >
                    <div
                        className={`bg-[#222831] w-[85%] max-w-sm h-full overflow-y-auto shadow-xl transform transition-transform duration-300 ${isClosing ? "-translate-x-full" : "translate-x-0"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-[#393E46] bg-[#393E46]">
                            <h2 className="text-white font-bold text-lg">Filters</h2>
                            <button
                                onClick={closeSidebar}
                                className="text-white hover:text-gray-300 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                                aria-label="Close filters"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
