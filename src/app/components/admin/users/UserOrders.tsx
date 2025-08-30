import { db } from '@/lib/db';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import { cartTable, cartItemTable, productTable, userTable } from '@/db/schema';
import Link from 'next/link';
import { formatPrice } from '@/app/components/global/Atoms';
import { Check, Clock, X, Package, Calendar, MessageSquare, PackageCheck } from 'lucide-react';

export default async function OrdersPage({ id }: { id: string }) {
    const orders = await db
        .select({
            id: cartTable.id,
            createdAt: cartTable.createdAt,
            updatedAt: cartTable.updatedAt,
            itemCount: sql<number>`count(${cartItemTable.productId})`,
            status: cartTable.status,
            total: sql<number>`sum(${productTable.price} * ${cartItemTable.quantity})`,
            firstItemName: sql<string>`(
                SELECT ${productTable.name} 
                FROM ${productTable} 
                INNER JOIN ${cartItemTable} ON ${productTable.id} = ${cartItemTable.productId} 
                WHERE ${cartItemTable.cartId} = ${cartTable.id} 
                LIMIT 1
            )`
        })
        .from(cartTable)
        .leftJoin(cartItemTable, eq(cartTable.id, cartItemTable.cartId))
        .leftJoin(productTable, eq(cartItemTable.productId, productTable.id))
        .where(and(eq(cartTable.userId, id), inArray(cartTable.status, ['ordered', 'shipped', 'delivered', 'cancelled'])))
        .groupBy(cartTable.id)
        .orderBy(desc(cartTable.id));

    const totalOrders = orders.length;
    const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
    }).length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const [{ userName }] = await db.select({ userName: userTable.name }).from(userTable).where(eq(userTable.id, id));
    const firstName = userName.split(' ')[0];

    if (totalOrders === 0) {
        return (
            <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">{userName}&apos;s Orders</h1>
                        <p className="text-gray-400">
                            Track and manage {userName}&apos;s orders here
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038] p-6">
                    <div className="text-4xl mb-4 opacity-50">📦</div>
                    <h2 className="font-bold text-xl mb-2 text-white">No Orders Yet</h2>
                    <p className="text-gray-400 mb-4">
                        {firstName} haven&apos;t placed any orders yet.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                    >
                        <Package className="w-5 h-5 mr-2" />
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'shipped':
                return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'ordered':
                return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'cancelled':
                return 'text-red-400 bg-red-500/20 border-red-500/30';
            default:
                return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return <Check className="w-4 h-4" />;
            case 'shipped':
                return <Package className="w-4 h-4" />;
            case 'ordered':
                return <Clock className="w-4 h-4" />;
            case 'cancelled':
                return <X className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const displayOrders = orders.map((order) => {
        const date = new Date(order.updatedAt);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
        const itemsText = order.itemCount === 1
            ? order.firstItemName
            : `${order.firstItemName} + ${order.itemCount - 1} more`;
        const trimmedItems = itemsText.length > 30 ? itemsText.slice(0, 27) + '...' : itemsText;
        return (
            <tr key={order.id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3 text-gray-300 font-mono text-sm">#{order.id}</td>
                <td className="p-3 text-gray-300 text-sm">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formattedDate}
                    </div>
                </td>
                <td className="p-3">
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    </div>
                </td>
                <td className="p-3 text-sm text-gray-300">
                    <span title={itemsText}>{trimmedItems}</span>
                    {order.itemCount > 1 && (
                        <div className="text-xs text-gray-400 mt-1">{order.itemCount} items</div>
                    )}
                </td>
                <td className="p-3 text-sm text-gray-300 font-semibold">{formatPrice(order.total)}</td>
                <td className="p-3 text-center">
                    <Link
                        href={`/admin/users/${id}/orders/${order.id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 
                                 hover:bg-blue-500/30 hover:text-blue-300 rounded-lg transition-all duration-200 text-sm"
                    >
                        View Details
                    </Link>
                </td>
            </tr>
        );
    });

    const theadElements = ['Order ID', 'Date', 'Status', 'Items', 'Total', 'Action'];

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">{userName}&apos;s Orders</h1>
                    <p className="text-gray-400">
                        Track and manage all {userName}&apos;s orders
                        <span className="ml-2">• {totalOrders} total</span>
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Orders</p>
                            <p className="text-2xl font-bold text-white">{totalOrders}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Delivered</p>
                            <p className="text-2xl font-bold text-yellow-400">{deliveredOrders}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <PackageCheck className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Recent (30d)</p>
                            <p className="text-2xl font-bold text-green-400">{recentOrders}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">All Orders</h2>
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
                                {theadElements.map((el) => (
                                    <th key={el} className={`p-3 text-sm font-semibold text-gray-300 ${['Status', 'Action'].includes(el) ? 'text-center' : 'text-left'}`}>
                                        {el}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayOrders}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    {orders.map((order) => {
                        const date = new Date(order.createdAt);
                        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
                        const itemsText = order.itemCount === 1 ? order.firstItemName : `${order.firstItemName} + ${order.itemCount - 1} more`;
                        return (
                            <div key={order.id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="font-mono text-sm font-medium text-gray-200">#{order.id}</span>
                                        <div
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 ml-2 rounded-full text-xs font-medium border 
                                            ${getStatusColor(order.status)}`}
                                        >
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {formattedDate}
                                        </div>
                                    </div>
                                    <div className="ml-3 text-right font-semibold text-gray-200">{formatPrice(order.total)}</div>
                                </div>
                                <p className="text-sm text-gray-300 mb-3">{itemsText}</p>
                                <div className="flex justify-end">
                                    <Link
                                        href={`/admin/users/${id}/orders/${order.id}`}
                                        className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 
                                                 hover:bg-blue-500/30 hover:text-blue-300 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="text-center text-sm text-gray-400 pb-4">
                Showing all {totalOrders} order{totalOrders !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
