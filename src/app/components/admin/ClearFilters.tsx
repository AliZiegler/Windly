"use client"
import { X } from "lucide-react";

export default function ClearFilters() {
    const resetPage = () => {
        window.location.href = window.location.pathname;
    };

    return (
        <button
            onClick={resetPage}
            className="flex-1 xl:flex-none text-sm text-gray-400 hover:text-white transition-colors duration-200 
            flex items-center justify-center gap-2 px-6 py-3 hover:bg-[#2a3038] rounded-xl border border-[#3a4048] 
            hover:border-[#4a5058] min-w-[140px]"
        >
            <X className="w-4 h-4" />
            Clear Filters
        </button>
    )
}
