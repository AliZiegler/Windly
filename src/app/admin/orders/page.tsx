import { db } from "@/lib/db";
import { eq, and, or, gte, lte, asc, desc, like, sql, count } from "drizzle-orm";
import { cartTable, cartItemTable, productTable, userTable } from "@/db/schema";
import Link from "next/link";
import { formatPrice } from "@/app/components/global/Atoms";
import FilterForm from "@/app/components/admin/orders/FilterForm";
import {
    Eye, Package, TrendingUp, CheckCircle,
    XCircle, Truck, ShoppingCart
} from "lucide-react";
import { ResolvedSearchParamsType, SearchParamsType } from "@/app/components/global/Types";
import SummaryFilter from "@/app/components/global/SummaryFilter";

function normalizeParams(sp: ResolvedSearchParamsType) {
    const toStr = (val: string | string[] | undefined): string | undefined =>
        Array.isArray(val) ? val[0] : val;

    return {
        search: toStr(sp.search),
        status: toStr(sp.status),
        customer: toStr(sp.customer),
        minTotal: toStr(sp.minTotal),
        maxTotal: toStr(sp.maxTotal),
        dateFrom: toStr(sp.dateFrom),
        dateTo: toStr(sp.dateTo),
        sortBy: toStr(sp.sortBy) || 'createdAt',
        sortOrder: toStr(sp.sortOrder) || 'desc',
    };
}

export default async function AdminOrders({
    searchParams
}: {
    searchParams: SearchParamsType
}) {
    const sp = await searchParams;
    const { search, status, customer, minTotal, maxTotal, dateFrom, dateTo, sortBy, sortOrder } =
        normalizeParams(sp);

    const buildWhereClause = () => {
        const conditions = [];

        // Only show orders (not active carts)
        conditions.push(
            or(
                eq(cartTable.status, 'ordered'),
                eq(cartTable.status, 'shipped'),
                eq(cartTable.status, 'delivered'),
                eq(cartTable.status, 'cancelled')
            )
        );

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(userTable.name, searchTerm),
                    like(userTable.email, searchTerm),
                    sql`CAST(${cartTable.id} AS TEXT) LIKE ${searchTerm}`
                )
            );
        }

        if (status) conditions.push(eq(cartTable.status, status as 'ordered' | 'shipped' | 'delivered' | 'cancelled'));
        if (customer) conditions.push(like(userTable.name, `%${customer}%`));

        if (dateFrom) {
            conditions.push(gte(cartTable.createdAt, dateFrom));
        }
        if (dateTo) {
            conditions.push(lte(cartTable.createdAt, dateTo + ' 23:59:59'));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    };

    const buildOrderClause = () => {
        let column;
        switch (sortBy) {
            case 'id':
                column = cartTable.id;
                break;
            case 'customer':
                column = userTable.name;
                break;
            case 'status':
                column = cartTable.status;
                break;
            case 'total':
                column = sql<number>`order_total`;
                break;
            case 'itemCount':
                column = sql<number>`item_count`;
                break;
            case 'updatedAt':
                column = cartTable.updatedAt;
                break;
            default:
                column = cartTable.createdAt;
        }

        return sortOrder === 'asc' ? asc(column) : desc(column);
    };

    // Get orders with calculated totals and item counts
    const ordersQuery = await db
        .select({
            id: cartTable.id,
            userId: cartTable.userId,
            status: cartTable.status,
            createdAt: cartTable.createdAt,
            updatedAt: cartTable.updatedAt,
            customerName: userTable.name,
            customerEmail: userTable.email,
            itemCount: count(cartItemTable.productId),
            orderTotal: sql<number>`COALESCE(SUM(
                ${cartItemTable.quantity} * ${productTable.price} * (1 - ${productTable.discount} / 100)
            ), 0)`
        })
        .from(cartTable)
        .leftJoin(userTable, eq(cartTable.userId, userTable.id))
        .leftJoin(cartItemTable, eq(cartTable.id, cartItemTable.cartId))
        .leftJoin(productTable, eq(cartItemTable.productId, productTable.id))
        .where(buildWhereClause())
        .groupBy(cartTable.id, cartTable.userId, cartTable.status, cartTable.createdAt, cartTable.updatedAt, userTable.name, userTable.email)
        .orderBy(buildOrderClause());

    // Filter by total amount if specified
    let ordersWithStats = ordersQuery;
    if (minTotal || maxTotal) {
        ordersWithStats = ordersQuery.filter((order) => {
            if (minTotal && order.orderTotal < parseFloat(minTotal)) return false;
            if (maxTotal && order.orderTotal > parseFloat(maxTotal)) return false;
            return true;
        });
    }

    // Get summary statistics
    const totalOrders = ordersWithStats.length;
    const shippedOrders = ordersWithStats.filter((o: { status: string }) => o.status === 'shipped').length;
    const deliveredOrders = ordersWithStats.filter((o: { status: string }) => o.status === 'delivered').length;
    const totalRevenue = ordersWithStats.reduce((sum: number, o: { orderTotal: number }) => sum + o.orderTotal, 0);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ordered':
                return { text: 'Ordered', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', icon: ShoppingCart };
            case 'shipped':
                return { text: 'Shipped', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30', icon: Truck };
            case 'delivered':
                return { text: 'Delivered', color: 'text-green-400 bg-green-500/20 border-green-500/30', icon: CheckCircle };
            case 'cancelled':
                return { text: 'Cancelled', color: 'text-red-400 bg-red-500/20 border-red-500/30', icon: XCircle };
            default:
                return { text: status, color: 'text-gray-400 bg-gray-500/20 border-gray-500/30', icon: Package };
        }
    };

    const displayOrders = ordersWithStats.map((order: {
        id: number;
        status: string;
        createdAt: string;
        userId: string;
        updatedAt: string;
        customerName: string | null;
        customerEmail: string | null;
        itemCount: number;
        orderTotal: number;
    }) => {
        const { id, status, createdAt, userId, updatedAt, customerName, customerEmail, itemCount, orderTotal } = order
        const createdDate = new Date(createdAt);
        const updatedDate = new Date(updatedAt);
        const formattedCreatedDate = createdDate.toLocaleDateString("en-GB");
        const formattedUpdatedDate = updatedDate.toLocaleDateString("en-GB");
        const statusInfo = getStatusInfo(status);
        const StatusIcon = statusInfo.icon;

        return (
            <tr key={id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2a3038] flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-[#00CAFF]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/admin/orders/${id}`}
                                className="font-medium hover:text-[#00CAFF] duration-200 text-gray-200 block">
                                Order #{id}
                            </Link>
                            <div className="text-xs text-gray-400 mt-1">
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-3 text-sm text-gray-300">
                    <div>
                        <div className="font-medium text-gray-200 hover:text-[#00CAFF] duration-200">
                            <Link
                                href={`/admin/users/${userId}`}>
                                {customerName || 'Unknown'}
                            </Link>
                        </div>
                        <div className="text-xs text-gray-400">{customerEmail || 'No email'}</div>
                    </div>
                </td>
                <td className="p-3">
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.text}
                        </span>
                    </div>
                </td>
                <td className="p-3 text-sm font-semibold text-green-400 text-center">
                    {formatPrice(orderTotal)}
                </td>
                <td className="p-3 text-xs text-gray-400 text-center">
                    <div>
                        <div>Created: {formattedCreatedDate}</div>
                        <div className="text-gray-500">Updated: {formattedUpdatedDate}</div>
                    </div>
                </td>
                <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            href={`/admin/orders/${id}`}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 group"
                            title="View Order Details"
                        >
                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                        </Link>
                    </div>
                </td>
            </tr>
        );
    });

    const theadElements = ['Order', 'Customer', 'Status', 'Total', 'Dates', 'Action'];
    const leftAlignedHeaders = ['Order', 'Customer'];
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
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">Order Management</h1>
                    <p className="text-gray-400">
                        Track and manage customer orders
                        {totalOrders > 0 && (
                            <span className="ml-2">• {totalOrders} order{totalOrders !== 1 ? 's' : ''} found</span>
                        )}
                    </p>
                </div>
            </div>

            <SummaryFilter>
                <FilterForm searchParams={sp} />
            </SummaryFilter>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-white">{totalOrders}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Package className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Shipped</p>
                            <p className="text-2xl font-bold text-yellow-400">{shippedOrders}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Truck className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Delivered</p>
                            <p className="text-2xl font-bold text-green-400">{deliveredOrders}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Revenue</p>
                            <p className="text-2xl font-bold text-green-400">{formatPrice(totalRevenue)}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                            {Object.keys(sp).length > 0 ? 'Filtered Orders' : 'All Orders'}
                        </h2>
                        <span className="text-sm text-gray-400">
                            {totalOrders} order{totalOrders !== 1 ? 's' : ''}
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
                            {displayOrders}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    {ordersWithStats.map((order: {
                        id: number;
                        status: string;
                        userId: string
                        createdAt: string;
                        updatedAt: string;
                        customerName: string | null;
                        customerEmail: string | null;
                        itemCount: number;
                        orderTotal: number;
                    }) => {
                        const { id, status, userId, createdAt, updatedAt, customerName, customerEmail, itemCount, orderTotal } = order;
                        const createdDate = new Date(createdAt);
                        const updatedDate = new Date(updatedAt);
                        const formattedCreatedDate = createdDate.toLocaleDateString('en-GB');
                        const formattedUpdatedDate = updatedDate.toLocaleDateString('en-GB');
                        const statusInfo = getStatusInfo(status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-lg bg-[#2a3038] flex items-center justify-center flex-shrink-0">
                                        <Package className="w-6 h-6 text-[#00CAFF]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/admin/orders/${id}`}
                                            className="font-medium text-gray-200 hover:text-[#00CAFF] duration-200 block">
                                            Order #{id}
                                        </Link>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                                        </div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            <div className="font-medium hover:text-[#00CAFF] duration-200">
                                                <Link
                                                    href={`/admin/users/${userId}`}>
                                                    {customerName || 'Unknown'}
                                                </Link>
                                            </div>
                                            <div className="text-xs text-gray-400">{customerEmail || 'No email'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">Status:</span>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Total:</span>
                                        <div className="font-semibold text-gray-200">
                                            {formatPrice(orderTotal)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Created:</span>
                                        <div className="text-gray-200">{formattedCreatedDate}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Updated:</span>
                                        <div className="text-gray-200">{formattedUpdatedDate}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end">
                                    <Link
                                        href={`/admin/orders/${id}`}
                                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                                    >
                                        <Eye className="w-5 h-5 text-blue-400" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* No Orders Found */}
            {ordersWithStats.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038]">
                    <div className="text-4xl mb-4 opacity-50">📦</div>
                    <h2 className="font-bold text-xl mb-2 text-white">
                        {Object.keys(sp).length > 0 ? 'No Orders Match Your Filters' : 'No Orders Found'}
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {Object.keys(sp).length > 0
                            ? 'Try adjusting your search criteria or clear the filters to see all orders.'
                            : 'Orders will appear here once customers start placing them.'
                        }
                    </p>
                    {Object.keys(sp).length > 0 && (
                        <Link
                            href="/admin/orders"
                            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-500 
                                     text-white font-medium rounded-lg transition-all duration-200"
                        >
                            Clear Filters
                        </Link>
                    )}
                </div>
            )}

            {/* Results Summary */}
            {totalOrders > 0 && (
                <div className="text-center text-sm text-gray-400 pb-4">
                    Showing {totalOrders} order{totalOrders !== 1 ? 's' : ''}
                    {Object.keys(sp).length > 0 && ' matching your filters'}
                </div>
            )}
        </div>
    );
}
