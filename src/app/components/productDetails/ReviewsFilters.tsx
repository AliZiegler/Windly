"use client";

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { RatingSlider } from "@/app/components/global/SimpleComponents";

type ReviewsFiltersProps = {
    totalReviews: number;
    filteredCount: number;
    currentSort?: string;
    currentRating?: string;
    currentSearch?: string;
    currentHelpful?: string;
}

export default function ReviewsFilters({
    totalReviews,
    filteredCount,
    currentSort = 'newest',
    currentSearch = '',
    currentHelpful = 'false'
}: ReviewsFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchInput, setSearchInput] = useState(currentSearch);

    const updateFilters = (key: string, value: string | [number, number]) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === 'rating' && Array.isArray(value)) {
            // Handle range slider values
            const [min, max] = value;

            if (min === 0) {
                params.delete('minRating');
            } else {
                params.set('minRating', min.toString());
            }

            if (max === 5) {
                params.delete('maxRating');
            } else {
                params.set('maxRating', max.toString());
            }
        } else {
            const isDefault =
                (key === 'sort' && value === 'newest') ||
                (key === 'search' && value === '');

            if (isDefault) {
                params.delete(key);
            } else {
                params.set(key, value as string);
            }
        }

        const queryString = params.toString();
        const url = queryString ? `${pathname}?${queryString}` : pathname;

        startTransition(() => {
            router.push(url, { scroll: false });
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters("search", searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput('');
        startTransition(() => {
            router.push(pathname, { scroll: false });
        });
    };

    const hasActiveFilters =
        searchParams.get('minRating') !== null ||
        searchParams.get('maxRating') !== null ||
        currentSearch !== '' ||
        currentHelpful === 'true';

    return (
        <div className="border border-gray-700/50 rounded-2xl p-6 mb-8" style={{ backgroundColor: "#2a313c" }}>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search reviews..."
                                className="w-full h-12 pl-10 pr-4 border border-gray-600/50 rounded-lg text-gray-100 placeholder-gray-400 
                 focus:border-blue-400 focus:outline-none transition-colors"
                                style={{ backgroundColor: "#1e252d" }}
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput("");
                                        updateFilters("search", "");
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="flex max-sm:flex-col gap-4">
                    <div className="lg:min-w-64 max-lg:w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
                        <select
                            value={currentSort || 'newest'}
                            onChange={(e) => updateFilters('sort', e.target.value)}
                            disabled={isPending}
                            className="w-full h-12 px-3 border border-gray-600/50 rounded-lg text-gray-100 cursor-pointer
                            focus:border-blue-400 focus:outline-none transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#1e252d" }}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                            <option value="helpful">Most Helpful</option>
                        </select>
                    </div>

                    {/* Rating Filter */}
                    <div className="lg:min-w-64 max-lg:w-full">
                        {/* Rating Filter */}
                        <div className="lg:min-w-64 max-lg:w-full mt-5">
                            <RatingSlider
                                defaultValue={[
                                    Number(searchParams.get("minRating")) || 0,
                                    Number(searchParams.get("maxRating")) || 5
                                ]}
                                label="Rating Range"
                                inputName="rating"
                                onChange={(values) => updateFilters('rating', values)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                        {filteredCount === totalReviews
                            ? `Showing all ${totalReviews} reviews`
                            : `Showing ${filteredCount} of ${totalReviews} reviews`
                        }
                    </span>
                    {isPending && (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                        </div>
                    )}
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        disabled={isPending}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 border 
                        border-gray-600/50 hover:border-gray-500 rounded-lg transition-all duration-200 disabled:opacity-50"
                        style={{ backgroundColor: "#1e252d" }}
                    >
                        <X size={20} />
                        Clear Filters
                    </button>
                )}
            </div>

            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {currentSearch && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-lg text-sm">
                            Search: &quot;{currentSearch}&quot;
                            <button
                                onClick={() => {
                                    setSearchInput('');
                                    updateFilters('search', '');
                                }}
                                className="hover:text-blue-200"
                            >
                                <X size={16} />
                            </button>
                        </span>
                    )}
                    {(searchParams.get('minRating') || searchParams.get('maxRating')) && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 rounded-lg text-sm">
                            Rating: {searchParams.get('minRating') || 0} - {searchParams.get('maxRating') || 5} Stars
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.delete('minRating');
                                    params.delete('maxRating');
                                    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
                                    startTransition(() => router.push(url, { scroll: false }));
                                }}
                                className="hover:text-yellow-200"
                            >
                                <X size={16} />
                            </button>
                        </span>
                    )}
                    {currentHelpful === 'true' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 border border-green-400/30 rounded-lg text-sm">
                            Helpful to Me
                            <button
                                onClick={() => updateFilters('helpful', 'false')}
                                className="hover:text-green-200"
                            >
                                <X size={16} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
