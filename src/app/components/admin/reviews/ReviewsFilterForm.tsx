import { Search, ChevronDown, MessageSquare, Calendar } from 'lucide-react';
import ClearFilters from '@/app/components/admin/ClearFilters';
import { redirect } from 'next/navigation';
import { ResolvedSearchParamsType } from '@/app/components/global/Types';
import { RatingSlider } from '@/app/components/global/SimpleComponents';

type SearchParams = {
    search?: string;
    rating?: string;
    minRating?: string;
    maxRating?: string;
    userId?: string;
    productId?: string;
    hasHelpful?: string;
    minHelpful?: string;
    maxHelpful?: string;
    createdAfter?: string;
    createdBefore?: string;
    sortBy?: string;
    sortOrder?: string;
}

const DEFAULT_VALUES = {
    search: '',
    rating: '0',
    minRating: '0',
    maxRating: '0',
    userId: '',
    productId: '',
    hasHelpful: '',
    minHelpful: '',
    maxHelpful: '',
    createdAfter: '',
    createdBefore: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
};

const RATING_LABELS: { [key: string]: string } = {
    '0.5': '0.5 Stars - Terrible',
    '1': '1 Star - Very Poor',
    '1.5': '1.5 Stars - Very Poor',
    '2': '2 Stars - Poor',
    '2.5': '2.5 Stars - Poor',
    '3': '3 Stars - Average',
    '3.5': '3.5 Stars - Above Average',
    '4': '4 Stars - Good',
    '4.5': '4.5 Stars - Very Good',
    '5': '5 Stars - Excellent'
};

const HELPFUL_STATUS_LABELS: { [key: string]: string } = {
    '1': 'Has Helpful Votes',
    '0': 'No Helpful Votes'
};

const SelectInput = ({ name, label, options, defaultValue }:
    { name: string; label: string; options: { value: string; label: string }[], defaultValue: string }) => {
    const displayOptions = options.map((option) => (
        <option key={option.value} value={option.value}>
            {option.label}
        </option>
    ))
    return (
        <div className="space-y-3 group">
            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">{label}</label>
            <div className="relative">
                <select
                    name={name}
                    defaultValue={defaultValue || ''}
                    className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] 
                    focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer hover:border-[#4a5058] 
                    focus:bg-[#2f353d] pr-12"
                >
                    {displayOptions}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    )
}

export default function ReviewFilterForm({
    searchParams
}: {
    searchParams: ResolvedSearchParamsType;
}) {
    const getActiveFiltersCount = () => {
        let count = 0;
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && value !== DEFAULT_VALUES[key as keyof SearchParams] && key !== 'sortBy' && key !== 'sortOrder') {
                count++;
            }
        });
        return count;
    };

    const formatFilterDisplay = (key: string, value: string) => {
        let displayKey = key;
        let displayValue = value;

        switch (key) {
            case 'rating':
                displayKey = 'Rating';
                displayValue = RATING_LABELS[value] || `${value} Stars`;
                break;
            case 'minRating':
                displayKey = 'Min Rating';
                displayValue = `${value}+ Stars`;
                break;
            case 'maxRating':
                displayKey = 'Max Rating';
                displayValue = `≤${value} Stars`;
                break;
            case 'hasHelpful':
                displayKey = 'Helpful Status';
                displayValue = HELPFUL_STATUS_LABELS[value] || value;
                break;
            case 'minHelpful':
                displayKey = 'Min Helpful';
                displayValue = `${value}+ votes`;
                break;
            case 'maxHelpful':
                displayKey = 'Max Helpful';
                displayValue = `≤${value} votes`;
                break;
            case 'createdAfter':
                displayKey = 'Created After';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'createdBefore':
                displayKey = 'Created Before';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'userId':
                displayKey = 'User ID';
                displayValue = `User #${value}`;
                break;
            case 'productId':
                displayKey = 'Product ID';
                displayValue = `Product #${value}`;
                break;
            default:
                displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return { displayKey, displayValue };
    };

    const activeFiltersCount = getActiveFiltersCount();

    async function handleFilterReviews(formData: FormData) {
        "use server";

        const params: SearchParams = {
            search: formData.get("search") as string,
            rating: formData.get("rating") as string,
            minRating: formData.get("minRating") as string,
            maxRating: formData.get("maxRating") as string,
            userId: formData.get("userId") as string,
            productId: formData.get("productId") as string,
            hasHelpful: formData.get("hasHelpful") as string,
            minHelpful: formData.get("minHelpful") as string,
            maxHelpful: formData.get("maxHelpful") as string,
            createdAfter: formData.get("createdAfter") as string,
            createdBefore: formData.get("createdBefore") as string,
            sortBy: formData.get("sortBy") as string,
            sortOrder: formData.get("sortOrder") as string,
        };

        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (
                value &&
                value !== DEFAULT_VALUES[key as keyof SearchParams]
            ) {
                searchParams.set(key, value);
            }
        });

        // Handle edge cases for numeric inputs
        if (searchParams.get("maxHelpful") === "0" || Number(searchParams.get("maxHelpful")) < Number(searchParams.get("minHelpful"))) {
            searchParams.delete("maxHelpful");
        }
        if (searchParams.get("minHelpful") === "0") {
            searchParams.delete("minHelpful");
        }

        // Validate rating ranges
        if (Number(searchParams.get("maxRating")) < Number(searchParams.get("minRating"))) {
            searchParams.delete("maxRating");
        }

        // Validate date ranges
        const createdAfter = searchParams.get("createdAfter");
        const createdBefore = searchParams.get("createdBefore");
        if (createdAfter && createdBefore && new Date(createdAfter) > new Date(createdBefore)) {
            searchParams.delete("createdBefore");
        }

        const query = searchParams.toString();
        redirect(`/admin/reviews${query ? `?${query}` : ""}`);
    }

    return (
        <div className="bg-midnight rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00CAFF]/10 to-transparent"></div>
            </div>

            <form action={handleFilterReviews} className="space-y-8 relative">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00CAFF]/10 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-[#00CAFF]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Filter Reviews</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}` :
                                    'Search and filter product reviews'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Search Reviews</label>
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                text-gray-400 group-focus-within:text-[#00CAFF] transition-colors" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchParams.search as string || ''}
                                placeholder="Search review content, user names, product names..."
                                className="w-full max-h-[54px] pl-12 pr-5 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white
                                placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 
                                font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-4 text-xl xl:text-lg max-h-[54px] text-center bg-[#ffa000] text-black font-semibold rounded-xl 
                            hover:bg-[#f19700] transition-all duration-200 flex items-center justify-center 
                            gap-3 min-w-[140px] xl:min-w-[160px] transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            <Search className="w-5 h-5" />
                            Search
                        </button>
                    </div>
                </div>

                <div className="border-t border-[#2a3038]"></div>

                {/* Filters Grid */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>

                    {/* Primary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-center">
                        {/* Exact Rating */}
                        <RatingSlider defaultValue={Number(searchParams.rating)} label="Exact Rating" inputName="rating" />
                        {/* Min Rating */}
                        <RatingSlider defaultValue={Number(searchParams.minRating)} label="Minimum Rating" inputName="minRating" />

                        {/* Max Rating */}
                        <RatingSlider defaultValue={Number(searchParams.maxRating)} label="Maximum Rating" inputName="maxRating" />
                        {/* Has Helpful Votes */}
                        <SelectInput
                            name="hasHelpful"
                            label="Helpful Status"
                            defaultValue={searchParams.hasHelpful as string || ''}
                            options={[
                                { value: '', label: 'All Reviews' },
                                { value: '1', label: 'Has Helpful Votes' },
                                { value: '0', label: 'No Helpful Votes' }
                            ]}
                        />
                    </div>

                    {/* Secondary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Min Helpful Votes */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Min Helpful Votes</label>
                            <input
                                type="number"
                                name="minHelpful"
                                defaultValue={searchParams.minHelpful as string || ''}
                                placeholder="0"
                                min="0"
                                step="1"
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 
                                focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>

                        {/* Max Helpful Votes */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Max Helpful Votes (0 for no limit)</label>
                            <input
                                type="number"
                                name="maxHelpful"
                                defaultValue={searchParams.maxHelpful as string || ''}
                                placeholder="100"
                                min="0"
                                step="1"
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 
                                focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>

                        {/* User ID */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">User ID</label>
                            <input
                                type="text"
                                name="userId"
                                defaultValue={searchParams.userId as string || ''}
                                placeholder="Filter by specific user ID"
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 
                                focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>

                        {/* Product ID */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Product ID</label>
                            <input
                                type="number"
                                name="productId"
                                defaultValue={searchParams.productId as string || ''}
                                placeholder="Filter by product ID"
                                min="1"
                                step="1"
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 
                                focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                        {/* Created After */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Created After</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="createdAfter"
                                    lang="en-GB"
                                    defaultValue={searchParams.createdAfter as string || ''}
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] 
                                    focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Created Before */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Created Before</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="createdBefore"
                                    defaultValue={searchParams.createdBefore as string || ''}
                                    lang="en-GB"
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] 
                                    focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Sort By</label>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <select
                                        name="sortBy"
                                        defaultValue={searchParams.sortBy as string || 'createdAt'}
                                        className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white 
                                        focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium appearance-none 
                                        cursor-pointer hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
                                    >
                                        <option value="createdAt">Date Created</option>
                                        <option value="updatedAt">Date Updated</option>
                                        <option value="rating">Rating</option>
                                        <option value="helpfulCount">Helpful Votes</option>
                                        <option value="userName">Reviewer Name</option>
                                        <option value="productName">Product Name</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <select
                                        name="sortOrder"
                                        defaultValue={searchParams.sortOrder as string || 'desc'}
                                        className="px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] 
                                        focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer min-w-[90px] 
                                        hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
                                    >
                                        <option value="asc">↑ Asc</option>
                                        <option value="desc">↓ Desc</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#2a3038]"></div>

                {/* Active Filters and Actions */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    {/* Active Filters */}
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(searchParams).map(([key, value]) => {
                                // Skip default values and sorting params
                                if (!value || value === DEFAULT_VALUES[key as keyof SearchParams] || key === 'sortBy' || key === 'sortOrder') {
                                    return null;
                                }

                                const { displayKey, displayValue } = formatFilterDisplay(key, value as string);

                                return (
                                    <div
                                        key={key}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00CAFF]/10 
                                        to-[#0099CC]/10 text-[#00CAFF] rounded-xl text-sm font-medium border border-[#00CAFF]/20 
                                        backdrop-blur-sm hover:from-[#00CAFF]/15 hover:to-[#0099CC]/15 transition-all duration-200"
                                    >
                                        <span className="text-gray-300 text-xs">{displayKey}:</span>
                                        <span className="font-semibold">{displayValue}</span>
                                    </div>
                                );
                            })}
                            {activeFiltersCount === 0 && (
                                <span className="text-gray-400 text-sm italic">No active filters</span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 w-full xl:w-auto">
                        {activeFiltersCount > 0 && (
                            <ClearFilters />
                        )}
                        <button
                            type="submit"
                            className="flex-1 xl:flex-none px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                            font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center 
                            justify-center gap-2 text-sm min-w-[140px] transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
