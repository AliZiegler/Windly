"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

interface ReviewsFiltersProps {
    productName: string;
    totalReviews: number;
    filteredCount: number;
    currentSort?: string;
    currentRating?: string;
    currentSearch?: string;
    currentHelpful?: string;
}

export default function ReviewsFilters({
    productName,
    totalReviews,
    filteredCount,
    currentSort = 'newest',
    currentRating = 'all',
    currentSearch = '',
    currentHelpful = 'false'
}: ReviewsFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchInput, setSearchInput] = useState(currentSearch);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === '' || value === 'all' || value === 'false') {
            params.delete(key);
        } else {
            params.set(key, value);
        }

        const queryString = params.toString();
        const url = `/${productName}/reviews${queryString ? `?${queryString}` : ''}`;

        startTransition(() => {
            router.push(url);
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters('search', searchInput.trim());
    };

    const clearFilters = () => {
        setSearchInput('');
        startTransition(() => {
            router.push(`/${productName}/reviews`);
        });
    };

    const hasActiveFilters = currentRating !== 'all' || currentSearch !== '' || currentHelpful === 'true';

    return (
        <div className="border border-gray-700/50 rounded-2xl p-6 mb-8" style={{ backgroundColor: "#2a313c" }}>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
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
                                    onClick={() => setSearchInput('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="flex max-sm:flex-col gap-4">
                    <div className="lg:min-w-64 max-lg:w-full">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
                        <select
                            value={currentSort}
                            onChange={(e) => updateFilters('sort', e.target.value)}
                            disabled={isPending}
                            className="w-full h-12 px-3 border border-gray-600/50 rounded-lg text-gray-100 
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                        <select
                            value={currentRating}
                            onChange={(e) => updateFilters('rating', e.target.value)}
                            disabled={isPending}
                            className="w-full h-12 px-3 border border-gray-600/50 rounded-lg text-gray-100 focus:border-blue-400 
                            focus:outline-none transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#1e252d" }}
                        >
                            <option value="all">All Stars</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                    {currentRating !== 'all' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 rounded-lg text-sm">
                            {currentRating} Stars
                            <button
                                onClick={() => updateFilters('rating', 'all')}
                                className="hover:text-yellow-200"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
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
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
