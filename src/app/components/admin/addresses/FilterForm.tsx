import { Search, ChevronDown, MapPin, Calendar } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ResolvedSearchParamsType } from '@/app/components/global/Types';
import ClearFilters from '@/app/components/admin/ClearFilters';
import { iraqiProvinces } from '@/app/components/global/Atoms';

type SearchParams = {
    search?: string;
    country?: string;
    state?: string;
    city?: string;
    addressType?: string;
    userRole?: string;
    userGender?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    sortBy?: string;
    sortOrder?: string;
}

const DEFAULT_VALUES = {
    search: '',
    country: '',
    state: '',
    city: '',
    addressType: '',
    userRole: '',
    userGender: '',
    updatedAfter: '',
    updatedBefore: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
};

const ADDRESS_TYPE_LABELS: { [key: string]: string } = {
    'home': 'Home',
    'office': 'Office'
};

const ROLE_LABELS: { [key: string]: string } = {
    'user': 'Customer',
    'seller': 'Seller',
    'admin': 'Administrator'
};

const GENDER_LABELS: { [key: string]: string } = {
    'male': 'Male',
    'female': 'Female',
};

// Common countries, states, and cities for quick filtering
const COMMON_COUNTRIES = [
    { value: '', label: 'Iraq' }
];

const IRAQI_PROVINCES_OPTIONS = iraqiProvinces.map(province => ({
    value: province,
    label: province
}));

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

export default function AddressFilterForm({
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
            case 'addressType':
                displayKey = 'Type';
                displayValue = ADDRESS_TYPE_LABELS[value] || value;
                break;
            case 'userRole':
                displayKey = 'User Role';
                displayValue = ROLE_LABELS[value] || value;
                break;
            case 'userGender':
                displayKey = 'User Gender';
                displayValue = GENDER_LABELS[value] || value;
                break;
            case 'updatedAfter':
                displayKey = 'Updated After';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'updatedBefore':
                displayKey = 'Updated Before';
                displayValue = new Date(value).toLocaleDateString();
                break;
            default:
                displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return { displayKey, displayValue };
    };

    const activeFiltersCount = getActiveFiltersCount();

    async function handleFilterAddresses(formData: FormData) {
        "use server";

        const params: SearchParams = {
            search: formData.get("search") as string,
            country: formData.get("country") as string,
            state: formData.get("state") as string,
            city: formData.get("city") as string,
            addressType: formData.get("addressType") as string,
            userRole: formData.get("userRole") as string,
            userGender: formData.get("userGender") as string,
            updatedAfter: formData.get("updatedAfter") as string,
            updatedBefore: formData.get("updatedBefore") as string,
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

        // Validate date ranges
        const updatedAfter = searchParams.get("updatedAfter");
        const updatedBefore = searchParams.get("updatedBefore");
        if (updatedAfter && updatedBefore && new Date(updatedAfter) > new Date(updatedBefore)) {
            searchParams.delete("updatedBefore");
        }

        const query = searchParams.toString();
        redirect(`/admin/addresses${query ? `?${query}` : ""}`);
    }

    return (
        <div className="bg-gradient-to-br from-[#1e232b] to-[#181d23] rounded-2xl border border-[#2a3038] p-8 mb-8 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00CAFF]/10 to-transparent"></div>
            </div>

            <form action={handleFilterAddresses} className="space-y-8 relative">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00CAFF]/10 rounded-lg">
                            <MapPin className="w-5 h-5 text-[#00CAFF]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Filter Addresses</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}` : 'Search and filter address database'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Search Addresses</label>
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                text-gray-400 group-focus-within:text-[#00CAFF] transition-colors" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchParams.search as string || ''}
                                placeholder="Search by address name, street, zip code, phone, or user..."
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

                    {/* Primary Filters - Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Country */}
                        <SelectInput
                            name="country"
                            label="Country"
                            defaultValue={searchParams.country as string || ''}
                            options={[
                                ...COMMON_COUNTRIES
                            ]}
                        />

                        {/* State */}
                        <SelectInput
                            name="state"
                            label="Province"
                            defaultValue={searchParams.state as string || ''}
                            options={[
                                { value: '', label: 'All Provinces' },
                                ...IRAQI_PROVINCES_OPTIONS
                            ]}
                        />

                        {/* City */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">City</label>
                            <input
                                type="text"
                                name="city"
                                defaultValue={searchParams.city as string || ''}
                                placeholder="Enter city name..."
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>

                        {/* Address Type */}
                        <SelectInput
                            name="addressType"
                            label="Address Type"
                            defaultValue={searchParams.addressType as string || ''}
                            options={[
                                { value: '', label: 'All Types' },
                                { value: 'home', label: 'Home' },
                                { value: 'office', label: 'Office' }
                            ]}
                        />
                    </div>

                    {/* Secondary Filters - User Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* User Role */}
                        <SelectInput
                            name="userRole"
                            label="User Role"
                            defaultValue={searchParams.userRole as string || ''}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'user', label: 'Customer' },
                                { value: 'seller', label: 'Seller' },
                                { value: 'admin', label: 'Administrator' }
                            ]}
                        />

                        {/* User Gender */}
                        <SelectInput
                            name="userGender"
                            label="User Gender"
                            defaultValue={searchParams.userGender as string || ''}
                            options={[
                                { value: '', label: 'All Genders' },
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' }
                            ]}
                        />

                        {/* Updated After */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Updated After</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="updatedAfter"
                                    defaultValue={searchParams.updatedAfter as string || ''}
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Updated Before */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Updated Before</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="updatedBefore"
                                    defaultValue={searchParams.updatedBefore as string || ''}
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
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
                                        defaultValue={searchParams.sortBy as string || 'updatedAt'}
                                        className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
                                    >
                                        <option value="updatedAt">Last Updated</option>
                                        <option value="name">Address Name</option>
                                        <option value="country">Country</option>
                                        <option value="state">State</option>
                                        <option value="city">City</option>
                                        <option value="addressType">Address Type</option>
                                        <option value="userName">User Name</option>
                                        <option value="userEmail">User Email</option>
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
