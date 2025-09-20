"use client";

import { Filter, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface CollapsibleFilterProps {
    children: React.ReactNode;
    title?: string;
    openStatus?: boolean;
}

export default function CollapsibleFilter({
    children,
    title = "Filter Options",
    openStatus = false
}: CollapsibleFilterProps) {
    const searchParams = useSearchParams();
    const hasActiveFilters = searchParams.size > 0;
    const [isOpen, setIsOpen] = useState(openStatus || hasActiveFilters);
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [children, isOpen]);

    const toggleFilter = () => setIsOpen(prev => !prev);
    const opacityClass = isOpen ? "opacity-100" : "opacity-0";

    return (
        <div className="bg-midnight border border-[#76ABAE]/20 rounded-xl shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
            <button
                onClick={toggleFilter}
                className="w-full text-[#FCECDD] font-medium px-4 py-3 hover:bg-[#76ABAE]/10 
                flex items-center justify-between transition-colors duration-200 group cursor-pointer"
                aria-expanded={isOpen}
                aria-controls="filter-content"
            >
                <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#76ABAE] group-hover:text-[#76ABAE]/80 transition-colors" />
                    {title}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-[#76ABAE] transition-transform duration-300 ${isOpen && "rotate-180"}`}
                />
            </button>
            <div
                id="filter-content"
                style={{
                    maxHeight: isOpen ? `${height}px` : "0px",
                }}
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out border-t border-[#76ABAE]/10"
            >
                <div
                    ref={contentRef}
                    className={`p-2 transition-opacity duration-200 ${opacityClass}`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
