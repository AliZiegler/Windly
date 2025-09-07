import { Search, ChevronDown, Users, Calendar } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ResolvedSearchParamsType } from '@/app/components/global/Types';
import ClearFilters from '@/app/components/admin/ClearFilters';

type SearchParams = {
    search?: string;
    role?: string;
    gender?: string;
    emailVerified?: string;
    hasAddress?: string;
    hasPhone?: string;
    birthdayMonth?: string;
    joinedAfter?: string;
    joinedBefore?: string;
    minOrders?: string;
    maxOrders?: string;
    minSpent?: string;
    maxSpent?: string;
    sortBy?: string;
    sortOrder?: string;
}

const DEFAULT_VALUES = {
    search: '',
    role: '',
    gender: '',
    emailVerified: '',
    hasAddress: '',
    hasPhone: '',
    birthdayMonth: '',
    joinedAfter: '',
    joinedBefore: '',
    minOrders: '',
    maxOrders: '',
    minSpent: '',
    maxSpent: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
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

const EMAIL_STATUS_LABELS: { [key: string]: string } = {
    'verified': 'Email Verified',
    'unverified': 'Email Not Verified'
};

const MONTH_OPTIONS = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
];

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

export default function UserFilterForm({
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
            case 'role':
                displayKey = 'Role';
                displayValue = ROLE_LABELS[value] || value;
                break;
            case 'gender':
                displayKey = 'Gender';
                displayValue = GENDER_LABELS[value] || value;
                break;
            case 'emailVerified':
                displayKey = 'Email Status';
                displayValue = EMAIL_STATUS_LABELS[value] || value;
                break;
            case 'hasAddress':
                displayKey = 'Address';
                displayValue = value === '1' ? 'Has Address' : 'No Address';
                break;
            case 'hasPhone':
                displayKey = 'Phone';
                displayValue = value === '1' ? 'Has Phone' : 'No Phone';
                break;
            case 'birthdayMonth':
                displayKey = 'Birth Month';
                displayValue = MONTH_OPTIONS.find(m => m.value === value)?.label || value;
                break;
            case 'joinedAfter':
                displayKey = 'Joined After';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'joinedBefore':
                displayKey = 'Joined Before';
                displayValue = new Date(value).toLocaleDateString();
                break;
            case 'minOrders':
                displayKey = 'Min Orders';
                displayValue = `${value}`;
                break;
            case 'maxOrders':
                displayKey = 'Max Orders';
                displayValue = `${value}`;
                break;
            case 'minSpent':
                displayKey = 'Min Spent';
                displayValue = `$${value}`;
                break;
            case 'maxSpent':
                displayKey = 'Max Spent';
                displayValue = `$${value}`;
                break;
            default:
                displayKey = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return { displayKey, displayValue };
    };

    const activeFiltersCount = getActiveFiltersCount();

    async function handleFilterUsers(formData: FormData) {
        "use server";

        const params: SearchParams = {
            search: formData.get("search") as string,
            role: formData.get("role") as string,
            gender: formData.get("gender") as string,
            emailVerified: formData.get("emailVerified") as string,
            hasAddress: formData.get("hasAddress") as string,
            hasPhone: formData.get("hasPhone") as string,
            birthdayMonth: formData.get("birthdayMonth") as string,
            joinedAfter: formData.get("joinedAfter") as string,
            joinedBefore: formData.get("joinedBefore") as string,
            minOrders: formData.get("minOrders") as string,
            maxOrders: formData.get("maxOrders") as string,
            minSpent: formData.get("minSpent") as string,
            maxSpent: formData.get("maxSpent") as string,
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
        if (searchParams.get("maxOrders") === "0" || Number(searchParams.get("maxOrders")) < Number(searchParams.get("minOrders"))) {
            searchParams.delete("maxOrders");
        }
        if (searchParams.get("minOrders") === "0") {
            searchParams.delete("minOrders");
        }
        if (searchParams.get("maxSpent") === "0" || Number(searchParams.get("maxSpent")) < Number(searchParams.get("minSpent"))) {
            searchParams.delete("maxSpent");
        }
        if (searchParams.get("minSpent") === "0") {
            searchParams.delete("minSpent");
        }

        // Validate date ranges
        const joinedAfter = searchParams.get("joinedAfter");
        const joinedBefore = searchParams.get("joinedBefore");
        if (joinedAfter && joinedBefore && new Date(joinedAfter) > new Date(joinedBefore)) {
            searchParams.delete("joinedBefore");
        }

        const query = searchParams.toString();
        redirect(`/admin/users${query ? `?${query}` : ""}`);
    }

    return (
        <div className="bg-midnight rounded-2xl p-8 mb-8 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00CAFF]/10 to-transparent"></div>
            </div>

            <form action={handleFilterUsers} className="space-y-8 relative">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00CAFF]/10 rounded-lg">
                            <Users className="w-5 h-5 text-[#00CAFF]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Filter Users</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {activeFiltersCount > 0 ? `${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}` : 'Search and filter your user database'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300">Search Users</label>
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                text-gray-400 group-focus-within:text-[#00CAFF] transition-colors" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={searchParams.search as string || ''}
                                placeholder="Search by name, email, or phone..."
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
                        {/* Role */}
                        <SelectInput
                            name="role"
                            label="User Role"
                            defaultValue={searchParams.role as string || ''}
                            options={[
                                { value: '', label: 'All Roles' },
                                { value: 'user', label: 'Customer' },
                                { value: 'seller', label: 'Seller' },
                                { value: 'admin', label: 'Administrator' }
                            ]}
                        />

                        {/* Gender */}
                        <SelectInput
                            name="gender"
                            label="Gender"
                            defaultValue={searchParams.gender as string || ''}
                            options={[
                                { value: '', label: 'All Genders' },
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                            ]}
                        />

                        {/* Email Verification Status */}
                        <SelectInput
                            name="emailVerified"
                            label="Email Status"
                            defaultValue={searchParams.emailVerified as string || ''}
                            options={[
                                { value: '', label: 'All Users' },
                                { value: 'verified', label: 'Email Verified' },
                                { value: 'unverified', label: 'Email Not Verified' }
                            ]}
                        />

                        {/* Has Address */}
                        <SelectInput
                            name="hasAddress"
                            label="Address Status"
                            defaultValue={searchParams.hasAddress as string || ''}
                            options={[
                                { value: '', label: 'All Users' },
                                { value: '1', label: 'Has Address' },
                                { value: '0', label: 'No Address' }
                            ]}
                        />
                    </div>

                    {/* Secondary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Has Phone */}
                        <SelectInput
                            name="hasPhone"
                            label="Phone Status"
                            defaultValue={searchParams.hasPhone as string || ''}
                            options={[
                                { value: '', label: 'All Users' },
                                { value: '1', label: 'Has Phone' },
                                { value: '0', label: 'No Phone' }
                            ]}
                        />

                        {/* Birthday Month */}
                        <SelectInput
                            name="birthdayMonth"
                            label="Birth Month"
                            defaultValue={searchParams.birthdayMonth as string || ''}
                            options={[
                                { value: '', label: 'All Months' },
                                ...MONTH_OPTIONS
                            ]}
                        />

                        {/* Min Orders */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Min Orders</label>
                            <input
                                type="number"
                                name="minOrders"
                                defaultValue={searchParams.minOrders as string || ''}
                                placeholder="0"
                                min="0"
                                step="1"
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>

                        {/* Max Orders */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Max Orders (0 for no limit)</label>
                            <input
                                type="number"
                                name="maxOrders"
                                defaultValue={searchParams.maxOrders as string || ''}
                                placeholder="100"
                                min="0"
                                step="1"
                                className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                            />
                        </div>
                    </div>

                    {/* Tertiary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Min Spent */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Min Total Spent</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    name="minSpent"
                                    defaultValue={searchParams.minSpent as string || ''}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Max Spent */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Max Total Spent (0 for no limit)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                                <input
                                    type="number"
                                    name="maxSpent"
                                    defaultValue={searchParams.maxSpent as string || ''}
                                    placeholder="9999.99"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white placeholder-gray-400 focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Joined After */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Joined After</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="joinedAfter"
                                    defaultValue={searchParams.joinedAfter as string || ''}
                                    className="w-full pl-12 pr-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium hover:border-[#4a5058] focus:bg-[#2f353d]"
                                />
                            </div>
                        </div>

                        {/* Joined Before */}
                        <div className="space-y-3 group">
                            <label className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors">Joined Before</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="joinedBefore"
                                    defaultValue={searchParams.joinedBefore as string || ''}
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
                                        defaultValue={searchParams.sortBy as string || 'createdAt'}
                                        className="w-full px-4 py-4 bg-[#2a3038] border border-[#3a4048] rounded-xl text-white focus:border-[#00CAFF] focus:outline-none transition-all duration-200 text-sm font-medium appearance-none cursor-pointer hover:border-[#4a5058] focus:bg-[#2f353d] pr-10"
                                    >
                                        <option value="createdAt">Date Joined</option>
                                        <option value="name">Name</option>
                                        <option value="email">Email</option>
                                        <option value="role">Role</option>
                                        <option value="reviewCount">Review Count</option>
                                        <option value="purchaseCount">Purchase Count</option>
                                        <option value="totalSpent">Total Spent</option>
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
