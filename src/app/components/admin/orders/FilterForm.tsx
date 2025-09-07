import { Search, Filter, ChevronDown, Calendar } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ResolvedSearchParamsType } from '@/app/components/global/Types';
import ClearFilters from '@/app/components/admin/ClearFilters';

type SearchParams = {
    search?: string;
    status?: string;
    customer?: string;
    minTotal?: string;
    maxTotal?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
}

const DEFAULT_VALUES = {
    search: '',
    status: '',
    customer: '',
    minTotal: '',
    maxTotal: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
};

const STATUS_LABELS: { [key: string]: string } = {
    'ordered': 'Ordered',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
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
            case 'minTotal':
                displayKey = 'Min Total';
                displayValue = `$${value}`;
                break;
            case 'maxTotal':
                displayKey = 'Max Total';
                displayValue = `$${value}`;
                break;
            case 'status':
                displayKey = 'Status';
                displayValue = STATUS_LABELS[value] || value;
                break;
            case 'dateFrom':
                displayKey = 'From';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'dateTo':
                displayKey = 'To';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'customer':
                displayKey = 'Customer';
                break;
            default:
                displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return { displayKey, displayValue };
    };

    const activeFiltersCount = getActiveFiltersCount();

    async function handleFilterOrders(formData: FormData) {
        "use server";

        const params: SearchParams = {
            search: formData.get("search") as string,
            status: formData.get("status") as string,
            customer: formData.get("customer") as string,
            minTotal: formData.get("minTotal") as string,
            maxTotal: formData.get("maxTotal") as string,
            dateFrom: formData.get("dateFrom") as string,
            dateTo: formData.get("dateTo") as string,
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

        // Handle price validations
        if (searchParams.get("maxTotal") === "0" || Number(searchParams.get("maxTotal")) < Number(searchParams.get("minTotal"))) {
            searchParams.delete("maxTotal");
        }
        if (searchParams.get("minTotal") === "0") {
            searchParams.delete("minTotal");
        }

        // Handle date validations
        if (searchParams.get("dateFrom") && searchParams.get("dateTo")) {
            const fromDate = new Date(searchParams.get("dateFrom")!);
            const toDate = new Date(searchParams.get("dateTo")!);
            if (fromDate > toDate) {
                searchParams.delete("dateTo");
            }
        }

        const query = searchParams.toString();
        redirect(`/admin/orders${query ? `?${query}` : ""}`);
    }

    return (
        <div className="bg-midnight rounded-2xl  p-8 mb-8 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00CAFF]/10 to-transparent"></div>
            </div>

            <form action={handleFilterOrders} className="space-y-8 relative">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00CAFF]/10 rounded-lg">
                            <Filter className="w-5 h-5 text-[#00CAFF]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Filter Orders</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}` : 'Search and filter your order history'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Search Orders</label>
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                text-gray-400 group-focus-within:text-[#00CAFF] transition-colors" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchParams.search as string || ''}
                                placeholder="Search by order ID, customer name, or email..."
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
                        {/* Status */}
                        <SelectInput
                            name="status"
                            label="Order Status"
                            defaultValue={searchParams.status as string || ''}
                            options={[
                                { value: '', label: 'All Statuses' },
                                { value: 'ordered', label: 'Ordered' },
                                { value: 'shipped', label: 'Shipped' },
                                { value: 'delivered', label: 'Delivered' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                        />

                        {/* Customer Search */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Customer Name</label>
                            <input
                                type="text"
                                name="customer"
                                defaultValue={searchParams.customer as string || ''}
                                placeholder="Customer name..."
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white
                                placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 
                                font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>

                        {/* Date From */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Date From</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="dateFrom"
                                    defaultValue={searchParams.dateFrom as string || ''}
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white
                                    focus:border-[#00CAFF] focus:outline-none transition-all duration-200 
                                    font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Date To */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Date To</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="dateTo"
                                    defaultValue={searchParams.dateTo as string || ''}
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white
                                    focus:border-[#00CAFF] focus:outline-none transition-all duration-200 
                                    font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Secondary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Min Total */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Min Total</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    name="minTotal"
                                    defaultValue={searchParams.minTotal as string || ''}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Max Total */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Max Total (0 for no limit)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    name="maxTotal"
                                    defaultValue={searchParams.maxTotal as string || ''}
                                    placeholder="999.99"
                                    min="0"
                                    step="0.01"
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
                                        defaultValue={searchParams.sortBy as string || 'createdAt'}
                                        className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
                                    >
                                        <option value="createdAt">Order Date</option>
                                        <option value="updatedAt">Last Updated</option>
                                        <option value="id">Order ID</option>
                                        <option value="customer">Customer</option>
                                        <option value="status">Status</option>
                                        <option value="total">Total Amount</option>
                                        <option value="itemCount">Item Count</option>
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
