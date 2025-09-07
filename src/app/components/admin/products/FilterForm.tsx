import { Search, Filter, ChevronDown } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ResolvedSearchParamsType } from '@/app/components/global/Types';
import ClearFilters from '@/app/components/admin/ClearFilters';

type SearchParams = {
    search?: string;
    category?: string;
    brand?: string;
    stockStatus?: string;
    rating?: string;
    featured?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
}

const DEFAULT_VALUES = {
    search: '',
    category: '',
    brand: '',
    stockStatus: '',
    featured: '',
    minPrice: '',
    maxPrice: '',
    rating: '0',
    sortBy: 'dateAdded',
    sortOrder: 'desc',
};

const STOCK_LABELS: { [key: string]: string } = {
    'out': 'Out of Stock',
    'very-low': 'Very Low (1-4)',
    'low': 'Low Stock (5-9)',
    'in-stock': 'In Stock (10-49)',
    'well-stocked': 'Well Stocked (50+)'
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

export default function FilterForm({
    categories,
    brands,
    searchParams
}: {
    categories: string[];
    brands: string[];
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
            case 'minPrice':
                displayKey = 'Min Price';
                displayValue = `$${value}`;
                break;
            case 'maxPrice':
                displayKey = 'Max Price';
                displayValue = `$${value}`;
                break;
            case 'stockStatus':
                displayKey = 'Stock';
                displayValue = STOCK_LABELS[value] || value;
                break;
            case 'rating':
                displayKey = 'Rating';
                displayValue = `${value}`;
                break;
            case 'featured':
                displayKey = 'Type';
                displayValue = value === '1' ? 'Featured' : 'Non-Featured';
                break;
            default:
                displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return { displayKey, displayValue };
    };

    const activeFiltersCount = getActiveFiltersCount();
    async function handleFilterProducts(formData: FormData) {
        "use server";

        const params: SearchParams = {
            search: formData.get("search") as string,
            category: formData.get("category") as string,
            brand: formData.get("brand") as string,
            stockStatus: formData.get("stockStatus") as string,
            rating: formData.get("rating") as string,
            featured: formData.get("featured") as string,
            minPrice: formData.get("minPrice") as string,
            maxPrice: formData.get("maxPrice") as string,
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
        if (searchParams.get("maxPrice") === "0" || Number(searchParams.get("maxPrice")) < Number(searchParams.get("minPrice"))) {
            searchParams.delete("maxPrice");
        }
        if (searchParams.get("minPrice") === "0") {
            searchParams.delete("minPrice");
        }
        const query = searchParams.toString();
        redirect(`/admin/products${query ? `?${query}` : ""}`);
    }
    return (
        <div className="bg-midnight rounded-2xl p-8 mb-8 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00CAFF]/10 to-transparent"></div>
            </div>

            <form action={handleFilterProducts} className="space-y-8 relative">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00CAFF]/10 rounded-lg">
                            <Filter className="w-5 h-5 text-[#00CAFF]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Filter Products</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}` : 'Search and filter your product catalog'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Search Products</label>
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                text-gray-400 group-focus-within:text-[#00CAFF] transition-colors" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchParams.search as string || ''}
                                placeholder="Search by name, SKU, or description..."
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Category */}
                        <SelectInput
                            name="category"
                            label="Category"
                            defaultValue={searchParams.category as string || ''}
                            options={[
                                { value: '', label: 'All Categories' },
                                ...categories.map((category) => ({ value: category, label: category }))
                            ]}
                        />

                        {/* Brand */}
                        <SelectInput
                            name="brand"
                            label="Brand"
                            defaultValue={searchParams.brand as string || ''}
                            options={[
                                { value: "", label: 'All Brands' },
                                ...brands.map((brand) => ({ value: brand, label: brand }))
                            ]}
                        />
                        {/* Stock Status */}
                        <SelectInput
                            name="stockStatus"
                            label="Stock Status"
                            defaultValue={searchParams.stockStatus as string || ''}
                            options={[
                                { value: "", label: "All Stock Levels" },
                                { value: "out", label: "Out of Stock" },
                                { value: "very-low", label: "Very Low (1-4)" },
                                { value: "low", label: "Low Stock (5-9)" },
                                { value: "in-stock", label: "In Stock (10-49)" },
                                { value: "well-stocked", label: "Well Stocked (50+)" },
                            ]}
                        />
                        {/* Rating */}
                        <span className='flex flex-col justify-center'>
                            <label className="text-sm font-medium text-gray-300">Min Rating</label>
                            <input
                                type="range"
                                name="rating"
                                defaultValue={searchParams.rating as string || ''}
                                min="0"
                                max="5"
                                step="0.5"
                            />
                        </span>
                    </div>

                    {/* Secondary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Featured Status */}
                        <SelectInput
                            name="featured"
                            label="Product Type"
                            defaultValue={searchParams.featured as string || ''}
                            options={[
                                { value: "", label: "All Products" },
                                { value: "1", label: "Featured Only" },
                                { value: "0", label: "Non-Featured" },
                            ]}
                        />

                        {/* Min Price */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Min Price</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    name="minPrice"
                                    defaultValue={searchParams.minPrice as string || ''}
                                    placeholder="0.00"
                                    min="0"
                                    step="1"
                                    className="w-full pl-8 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Max Price */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Max Price (0 for no limit)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    defaultValue={searchParams.maxPrice as string || ''}
                                    placeholder="999.99"
                                    min="0"
                                    step="1"
                                    className="w-full pl-8 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Sort By</label>
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <select
                                        name="sortBy"
                                        defaultValue={searchParams.sortBy as string || 'dateAdded'}
                                        className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
                                    >
                                        <option value="dateAdded">Date Added</option>
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                        <option value="stock">Stock</option>
                                        <option value="avgRating">Rating</option>
                                        <option value="salesCount">Sales</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <select
                                        name="sortOrder"
                                        defaultValue={searchParams.sortOrder as string || 'desc'}
                                        className="px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer min-w-[90px] hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
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
