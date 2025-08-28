import { db } from "@/lib/db";
import { eq, count, sql, like, and, or, asc, desc } from "drizzle-orm";
import {
    userTable,
    reviewTable,
    cartItemTable,
    wishlistTable,
    addressTable,
    cartTable,
    productTable
} from "@/db/schema";
import Link from "next/link";
import {
    Eye, Users, UserCheck, UserX, TrendingUp,
    Mail, MapPin, Shield, User,
    Store
} from "lucide-react";
import Image from "next/image";
import { ResolvedSearchParamsType, SearchParamsType } from "@/app/components/global/Types";

function normalizeParams(sp: ResolvedSearchParamsType) {
    const toStr = (val: string | string[] | undefined): string | undefined =>
        Array.isArray(val) ? val[0] : val;

    return {
        search: toStr(sp.search),
        role: toStr(sp.role),
        gender: toStr(sp.gender),
        emailVerified: toStr(sp.emailVerified),
        hasAddress: toStr(sp.hasAddress),
    };
}

export default async function AdminUsers({
    searchParams
}: {
    searchParams: SearchParamsType
}) {
    const sp = await searchParams;
    const { search, role, gender, emailVerified } = normalizeParams(sp);

    const buildWhereClause = () => {
        const conditions = [];

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(userTable.name, searchTerm),
                    like(userTable.email, searchTerm),
                    like(userTable.phone, searchTerm)
                )
            );
        }
        function isRole(value: string): value is typeof userTable.$inferSelect.role {
            return ["user", "seller", "admin"].includes(value);
        }
        if (role && isRole(role)) {
            conditions.push(eq(userTable.role, role));
        }
        if (gender) conditions.push(eq(userTable.gender, gender));

        if (emailVerified === 'verified') {
            conditions.push(sql`${userTable.emailVerified} IS NOT NULL`);
        } else if (emailVerified === 'unverified') {
            conditions.push(sql`${userTable.emailVerified} IS NULL`);
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    };

    const buildOrderClause = () => {
        const sortBy = sp.sortBy || 'createdAt';
        const sortOrder = sp.sortOrder || 'desc';

        let column;
        switch (sortBy) {
            case 'name':
                column = userTable.name;
                break;
            case 'email':
                column = userTable.email;
                break;
            case 'role':
                column = userTable.role;
                break;
            case 'reviewCount':
                column = count(reviewTable.id);
                break;
            case 'purchaseCount':
                column = sql<number>`COALESCE((
                    SELECT COUNT(DISTINCT ${cartTable.id}) 
                    FROM ${cartTable} 
                    WHERE ${cartTable.userId} = ${userTable.id} 
                    AND ${cartTable.status} IN ('delivered', 'shipped' , 'ordered')
                ), 0)`;
                break;
            default:
                column = userTable.createdAt;
        }

        return sortOrder === 'asc' ? asc(column) : desc(column);
    };

    const usersWithStats = await db
        .select({
            id: userTable.id,
            name: userTable.name,
            email: userTable.email,
            emailVerified: userTable.emailVerified,
            image: userTable.image,
            gender: userTable.gender,
            birthday: userTable.birthday,
            phone: userTable.phone,
            role: userTable.role,
            createdAt: userTable.createdAt,
            reviewCount: count(reviewTable.id),
            wishlistCount: sql<number>`COALESCE((
                SELECT COUNT(*) 
                FROM ${wishlistTable} 
                WHERE ${wishlistTable.userId} = ${userTable.id}
            ), 0)`,
            purchaseCount: sql<number>`COALESCE((
                SELECT COUNT(DISTINCT c.id) 
                FROM ${cartTable} c
                WHERE c.user_id = ${userTable.id} 
                AND c.status IN ('delivered', 'shipped', 'ordered')
            ), 0)`,
            totalSpent: sql<number>`COALESCE((
                SELECT SUM(ci.quantity * p.price * (1 - p.discount / 100))
                FROM ${cartTable} c
                JOIN ${cartItemTable} ci ON c.id = ci.cart_id
                JOIN ${productTable} p ON ci.product_id = p.id
                WHERE c.user_id = ${userTable.id} 
                AND c.status IN ('delivered', 'shipped', 'ordered')
            ), 0)`,
            hasAddress: sql<number>`COALESCE((
                SELECT COUNT(*) 
                FROM ${addressTable} 
                WHERE ${addressTable.userId} = ${userTable.id}
            ), 0)`
        })
        .from(userTable)
        .leftJoin(reviewTable, eq(userTable.id, reviewTable.userId))
        .where(buildWhereClause())
        .groupBy(userTable.id)
        .orderBy(buildOrderClause());

    // Get all users for filter options (without filters applied)

    const totalUsers = usersWithStats.length;
    const adminUsers = usersWithStats.filter(u => u.role === 'admin').length;
    const normalUsers = usersWithStats.filter(u => u.role === 'user').length;
    const totalSpent = usersWithStats.reduce((sum, u) => sum + u.totalSpent, 0);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return { text: 'Admin', color: 'text-red-400 bg-red-500/20 border-red-500/30', icon: Shield };
            case 'seller':
                return { text: 'Seller', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', icon: Store };
            default:
                return { text: 'User', color: 'text-green-400 bg-green-500/20 border-green-500/30', icon: User };
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const displayUsers = usersWithStats.map((user) => {
        const date = new Date(user.createdAt!);
        const formattedDate = date.toLocaleDateString("en-GB");
        const roleBadge = getRoleBadge(user.role);
        const RoleBadgeIcon = roleBadge.icon;
        const isVerified = !!user.emailVerified;

        return (
            <tr key={user.id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2a3038] flex-shrink-0">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name}
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
                                href={`/admin/users/${user.id}`}
                                className="font-medium hover:text-[#00CAFF] duration-200 text-gray-200 truncate block">
                                {user.name}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                </span>
                                {isVerified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 
                                        rounded-full border border-green-500/30">
                                        <UserCheck className="w-3 h-3" />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${roleBadge.color}`}>
                        <RoleBadgeIcon className="w-3 h-3" />
                        {roleBadge.text}
                    </span>
                </td>
                <td className="p-3 text-sm text-gray-300 text-center">
                    {user.gender ? (
                        <span className="capitalize">{user.gender}</span>
                    ) : (
                        <span className="text-gray-500">Not specified</span>
                    )}
                </td>
                <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-gray-200">
                            {user.reviewCount}
                        </span>
                        <span className="text-xs text-gray-400">reviews</span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-gray-200">
                            {user.purchaseCount}
                        </span>
                        <span className="text-xs text-gray-400">orders</span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-green-400">
                            {formatPrice(user.totalSpent)}
                        </span>
                        <span className="text-xs text-gray-400">spent</span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-200">
                            {user.hasAddress}
                        </span>
                    </div>
                </td>
                <td className="p-3 text-xs text-gray-400 text-center">
                    {formattedDate}
                </td>
                <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            href={`/admin/users/${user.id}`}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 group"
                            title="View User Details"
                        >
                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                        </Link>
                        <button
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group cursor-pointer"
                            title="Ban User"
                        >
                            <UserX className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    });

    const theadElements = ['User', 'Role', 'Gender', 'Reviews', 'Orders', 'Total Spent', 'Addresses', 'Joined', 'Actions'];
    const leftAlignedHeaders = ['User'];
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
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">User Management</h1>
                    <p className="text-gray-400">
                        Manage user accounts and monitor user activity
                        {totalUsers > 0 && (
                            <span className="ml-2">• {totalUsers} user{totalUsers !== 1 ? 's' : ''} found</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-midnight rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <p className="text-2xl font-bold text-white">{totalUsers}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Customers</p>
                            <p className="text-2xl font-bold text-green-400">{normalUsers}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <UserCheck className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Admins</p>
                            <p className="text-2xl font-bold text-red-400">{adminUsers}</p>
                        </div>
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <Shield className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-400">{formatPrice(totalSpent)}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                            {Object.keys(sp).length > 0 ? 'Filtered Users' : 'All Users'}
                        </h2>
                        <span className="text-sm text-gray-400">
                            {totalUsers} user{totalUsers !== 1 ? 's' : ''}
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
                            {displayUsers}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    {usersWithStats.map((user) => {
                        const date = new Date(user.createdAt);
                        const formattedDate = date.toLocaleDateString('en-GB');
                        const roleBadge = getRoleBadge(user.role);
                        const RoleBadgeIcon = roleBadge.icon;
                        const isVerified = !!user.emailVerified;

                        return (
                            <div key={user.id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2a3038] flex-shrink-0">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name}
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
                                            href={`/admin/users/${user.id}`}
                                            className="font-medium text-gray-200 truncate hover:text-[#00CAFF] duration-200 block">
                                            {user.name}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${roleBadge.color}`}>
                                                <RoleBadgeIcon className="w-3 h-3" />
                                                {roleBadge.text}
                                            </span>
                                            {isVerified && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 
                                                    rounded-full border border-green-500/30 text-xs">
                                                    <UserCheck className="w-3 h-3" />
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">Gender:</span>
                                        <div className="text-gray-200 capitalize">
                                            {user.gender || 'Not specified'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Reviews:</span>
                                        <div className="text-gray-200">{user.reviewCount}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Orders:</span>
                                        <div className="text-gray-200">{user.purchaseCount}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Total Spent:</span>
                                        <div className="text-green-400 font-medium">{formatPrice(user.totalSpent)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Joined: {formattedDate}</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                                        >
                                            <Eye className="w-5 h-5 text-blue-400" />
                                        </Link>
                                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 cursor-pointer">
                                            <UserX className="w-5 h-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* No Users Found */}
            {usersWithStats.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038]">
                    <div className="text-4xl mb-4 opacity-50">👥</div>
                    <h2 className="font-bold text-xl mb-2 text-white">
                        {Object.keys(sp).length > 0 ? 'No Users Match Your Filters' : 'No Users Found'}
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {Object.keys(sp).length > 0
                            ? 'Try adjusting your search criteria or clear the filters to see all users.'
                            : 'No users have registered yet.'
                        }
                    </p>
                </div>
            )}

            {/* Results Summary */}
            {totalUsers > 0 && (
                <div className="text-center text-sm text-gray-400 pb-4">
                    Showing {totalUsers} user{totalUsers !== 1 ? 's' : ''}
                    {Object.keys(sp).length > 0 && ' matching your filters'}
                </div>
            )}
        </div>
    );
}
