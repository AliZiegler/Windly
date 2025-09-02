import { db } from "@/lib/db";
import AddressFilterForm from "@/app/components/admin/addresses/FilterForm";
import { eq, sql, like, and, or, asc, desc } from "drizzle-orm";
import {
    userTable,
    addressTable,
} from "@/db/schema";
import Link from "next/link";
import {
    Eye, MapPin, Home, Building, Phone,
    Mail, User, Trash2,
    Users
} from "lucide-react";
import Image from "next/image";
import { ResolvedSearchParamsType, SearchParamsType } from "@/app/components/global/Types";

function normalizeParams(sp: ResolvedSearchParamsType) {
    const toStr = (val: string | string[] | undefined): string | undefined =>
        Array.isArray(val) ? val[0] : val;

    return {
        search: toStr(sp.search),
        country: toStr(sp.country),
        state: toStr(sp.state),
        city: toStr(sp.city),
        addressType: toStr(sp.addressType),
        userRole: toStr(sp.userRole),
        userGender: toStr(sp.userGender),
        updatedAfter: toStr(sp.updatedAfter),
        updatedBefore: toStr(sp.updatedBefore),
    };
}

export default async function AdminAddresses({
    searchParams
}: {
    searchParams: SearchParamsType
}) {
    const sp = await searchParams;
    const { search, country, state, city, addressType, userRole, userGender, updatedAfter, updatedBefore } = normalizeParams(sp);

    const buildWhereClause = () => {
        const conditions = [];

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(addressTable.name, searchTerm),
                    like(addressTable.street, searchTerm),
                    like(addressTable.buildingNumber, searchTerm),
                    like(addressTable.zipCode, searchTerm),
                    like(addressTable.phone, searchTerm),
                    like(userTable.name, searchTerm),
                    like(userTable.email, searchTerm)
                )
            );
        }

        if (country) conditions.push(eq(addressTable.country, country));
        if (state) conditions.push(eq(addressTable.state, state));
        if (city) conditions.push(eq(addressTable.city, city));

        function isAddressType(value: string): value is typeof addressTable.$inferSelect.addressType {
            return ["home", "office"].includes(value);
        }
        if (addressType && isAddressType(addressType)) {
            conditions.push(eq(addressTable.addressType, addressType));
        }

        function isRole(value: string): value is typeof userTable.$inferSelect.role {
            return ["user", "seller", "admin"].includes(value);
        }
        if (userRole && isRole(userRole)) {
            conditions.push(eq(userTable.role, userRole));
        }

        if (userGender) conditions.push(eq(userTable.gender, userGender));

        if (updatedAfter) {
            conditions.push(sql`${addressTable.updatedAt} >= ${updatedAfter}`);
        }
        if (updatedBefore) {
            conditions.push(sql`${addressTable.updatedAt} <= ${updatedBefore}`);
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    };

    const buildOrderClause = () => {
        const sortBy = sp.sortBy || 'updatedAt';
        const sortOrder = sp.sortOrder || 'desc';

        let column;
        switch (sortBy) {
            case 'name':
                column = addressTable.name;
                break;
            case 'country':
                column = addressTable.country;
                break;
            case 'state':
                column = addressTable.state;
                break;
            case 'city':
                column = addressTable.city;
                break;
            case 'addressType':
                column = addressTable.addressType;
                break;
            case 'userName':
                column = userTable.name;
                break;
            case 'userEmail':
                column = userTable.email;
                break;
            default:
                column = addressTable.updatedAt;
        }

        return sortOrder === 'asc' ? asc(column) : desc(column);
    };

    const addressesWithUsers = await db
        .select({
            id: addressTable.id,
            name: addressTable.name,
            country: addressTable.country,
            phone: addressTable.phone,
            state: addressTable.state,
            city: addressTable.city,
            street: addressTable.street,
            buildingNumber: addressTable.buildingNumber,
            zipCode: addressTable.zipCode,
            addressType: addressTable.addressType,
            updatedAt: addressTable.updatedAt,
            userId: addressTable.userId,
            userName: userTable.name,
            userEmail: userTable.email,
            userImage: userTable.image,
            userRole: userTable.role,
            userGender: userTable.gender,
            userCreatedAt: userTable.createdAt,
        })
        .from(addressTable)
        .innerJoin(userTable, eq(addressTable.userId, userTable.id))
        .where(buildWhereClause())
        .orderBy(buildOrderClause());

    // Get statistics
    const totalAddresses = addressesWithUsers.length;
    const homeAddresses = addressesWithUsers.filter(a => a.addressType === 'home').length;
    const officeAddresses = addressesWithUsers.filter(a => a.addressType === 'office').length;
    const uniqueUsers = new Set(addressesWithUsers.map(a => a.userId)).size;

    const getAddressTypeBadge = (type: string) => {
        switch (type) {
            case 'home':
                return { text: 'Home', color: 'text-green-400 bg-green-500/20 border-green-500/30', icon: Home };
            case 'office':
                return { text: 'Office', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', icon: Building };
            default:
                return { text: 'Unknown', color: 'text-gray-400 bg-gray-500/20 border-gray-500/30', icon: MapPin };
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return { text: 'Admin', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
            case 'seller':
                return { text: 'Seller', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
            default:
                return { text: 'User', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
        }
    };

    const displayAddresses = addressesWithUsers.map((address) => {
        const date = new Date(address.updatedAt!);
        const formattedDate = date.toLocaleDateString("en-GB");
        const addressTypeBadge = getAddressTypeBadge(address.addressType);
        const roleBadge = getRoleBadge(address.userRole);
        const AddressTypeIcon = addressTypeBadge.icon;

        return (
            <tr key={address.id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2a3038] flex-shrink-0">
                            {address.userImage ? (
                                <Image
                                    src={address.userImage}
                                    alt={address.userName}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/admin/users/${address.userId}`}
                                className="font-medium hover:text-[#00CAFF] duration-200 text-gray-200 truncate block">
                                {address.userName}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {address.userEmail}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${roleBadge.color}`}>
                                    {roleBadge.text}
                                </span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-3">
                    <div className="min-w-0">
                        <div className="font-medium text-gray-200 truncate">
                            {address.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            ID: #{address.id}
                        </div>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${addressTypeBadge.color}`}>
                        <AddressTypeIcon className="w-3 h-3" />
                        {addressTypeBadge.text}
                    </span>
                </td>
                <td className="p-3">
                    <div className="min-w-0">
                        <div className="text-sm text-gray-200 truncate">
                            {address.street} {address.buildingNumber}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {address.city}, {address.state}
                        </div>
                        <div className="text-xs text-gray-400">
                            {address.zipCode}
                        </div>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-300">
                        <Phone className="w-4 h-4 text-blue-400" />
                        {address.phone}
                    </div>
                </td>
                <td className="p-3 text-xs text-gray-400 text-center">
                    {formattedDate}
                </td>
                <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            href={`addresses/${address.id}`}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 group"
                            title="View Address"
                        >
                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                        </Link>
                        <button
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group cursor-pointer"
                            title="Delete Address"
                        >
                            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    });

    const theadElements = ['User', 'Name', 'Type', 'Location', 'Phone', 'Updated', 'Actions'];
    const leftAlignedHeaders = ['User', 'Name', 'Location'];
    const displayTHeadElements = theadElements.map((element) => {
        const isTextLeft = leftAlignedHeaders.includes(element);
        return (
            <th key={element} className={`p-3 text-sm font-semibold text-gray-300 ${isTextLeft ? 'text-left' : 'text-center'}`}>
                {element}
            </th>
        )
    });

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">Address Management</h1>
                    <p className="text-gray-400">
                        Manage user addresses and monitor address data
                        {totalAddresses > 0 && (
                            <span className="ml-2">• {totalAddresses} address{totalAddresses !== 1 ? 'es' : ''} found</span>
                        )}
                    </p>
                </div>
            </div>

            <AddressFilterForm searchParams={sp} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-midnight rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Addresses</p>
                            <p className="text-2xl font-bold text-white">{totalAddresses}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <MapPin className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Home Addresses</p>
                            <p className="text-2xl font-bold text-green-400">{homeAddresses}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <Home className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Office Addresses</p>
                            <p className="text-2xl font-bold text-blue-400">{officeAddresses}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Building className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Unique Users</p>
                            <p className="text-2xl font-bold text-purple-400">{uniqueUsers}</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Addresses Table */}
            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                            {Object.keys(sp).length > 0 ? 'Filtered Addresses' : 'All Addresses'}
                        </h2>
                        <span className="text-sm text-gray-400">
                            {totalAddresses} address{totalAddresses !== 1 ? 'es' : ''}
                        </span>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2129]">
                            <tr>
                                {displayTHeadElements}
                            </tr>
                        </thead>
                        <tbody>
                            {displayAddresses}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    {addressesWithUsers.map((address) => {
                        const date = new Date(address.updatedAt);
                        const formattedDate = date.toLocaleDateString('en-GB');
                        const addressTypeBadge = getAddressTypeBadge(address.addressType);
                        const roleBadge = getRoleBadge(address.userRole);
                        const AddressTypeIcon = addressTypeBadge.icon;

                        return (
                            <div key={address.id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2a3038] flex-shrink-0">
                                        {address.userImage ? (
                                            <Image
                                                src={address.userImage}
                                                alt={address.userName}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/admin/users/${address.userId}`}
                                            className="font-medium text-gray-200 truncate hover:text-[#00CAFF] duration-200 block">
                                            {address.userName}
                                        </Link>
                                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                            <Mail className="w-3 h-3" />
                                            {address.userEmail}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${addressTypeBadge.color}`}>
                                                <AddressTypeIcon className="w-3 h-3" />
                                                {addressTypeBadge.text}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${roleBadge.color}`}>
                                                {roleBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-200">{address.name}</span>
                                        <div className="text-xs text-gray-400">ID: #{address.id}</div>
                                    </div>

                                    <div className="text-sm text-gray-300">
                                        <div>{address.street} {address.buildingNumber}</div>
                                        <div>{address.city}, {address.state}</div>
                                        <div>{address.zipCode}</div>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-gray-300">
                                        <Phone className="w-4 h-4 text-blue-400" />
                                        {address.phone}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xs text-gray-400">Updated: {formattedDate}</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/users/${address.userId}`}
                                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                                        >
                                            <Eye className="w-5 h-5 text-blue-400" />
                                        </Link>
                                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 cursor-pointer">
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* No Addresses Found */}
            {addressesWithUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038]">
                    <div className="text-4xl mb-4 opacity-50">📍</div>
                    <h2 className="font-bold text-xl mb-2 text-white">
                        {Object.keys(sp).length > 0 ? 'No Addresses Match Your Filters' : 'No Addresses Found'}
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {Object.keys(sp).length > 0
                            ? 'Try adjusting your search criteria or clear the filters to see all addresses.'
                            : 'No addresses have been added yet.'
                        }
                    </p>
                </div>
            )}

            {/* Results Summary */}
            {totalAddresses > 0 && (
                <div className="text-center text-sm text-gray-400 pb-4">
                    Showing {totalAddresses} address{totalAddresses !== 1 ? 'es' : ''}
                    {Object.keys(sp).length > 0 && ' matching your filters'}
                </div>
            )}
        </div>
    );
}
