import { auth } from '@/auth';
import { db } from '@/lib/db';
import { eq, desc, sql, and } from 'drizzle-orm';
import { cartTable, cartItemTable, productTable } from '@/db/schema';
import Link from 'next/link';
import { formatPrice } from '@/app/components/global/Atoms';

interface OrderWithItems {
    id: number;
    createdAt: string;
    updatedAt: string;
    total: number;
    itemCount: number;
    firstItemName: string;
    displayStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export default async function Orders() {
    const session = await auth();
    if (!session?.user?.id) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-gray-400 text-lg">Not logged in</div>
            </div>
        );
    }

    const orders = await db
        .select({
            id: cartTable.id,
            createdAt: cartTable.createdAt,
            updatedAt: cartTable.updatedAt,
            itemCount: sql<number>`count(${cartItemTable.productId})`,
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
        .where(and(eq(cartTable.userId, session.user.id), eq(cartTable.status, 'ordered')))
        .groupBy(cartTable.id)
        .orderBy(desc(cartTable.createdAt));

    const ordersWithStatus: OrderWithItems[] = orders.map(order => {
        const orderDate = new Date(order.updatedAt);
        const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

        let displayStatus: OrderWithItems['displayStatus'];
        if (daysSinceOrder === 0) {
            displayStatus = 'pending';
        } else if (daysSinceOrder <= 2) {
            displayStatus = 'processing';
        } else {
            displayStatus = 'shipped';
        }
        return {
            ...order,
            displayStatus
        };
    });

    if (ordersWithStatus.length === 0) {
        return (
            <div className="flex flex-col w-full items-center justify-center min-h-[300px] text-center">
                <div className="text-4xl mb-4 opacity-50">📦</div>
                <h1 className="font-bold text-2xl mb-2">My Orders</h1>
                <p className="text-gray-400 mb-4">You haven&apos;t placed any orders yet.</p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'shipped':
                return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'processing':
                return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            case 'pending':
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
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'shipped':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11L4 7" />
                    </svg>
                );
            case 'processing':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                );
            case 'pending':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'cancelled':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const displayOrders = ordersWithStatus.map((order) => {
        const date = new Date(order.updatedAt);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        const statusColor = getStatusColor(order.displayStatus);
        const statusIcon = getStatusIcon(order.displayStatus);

        const itemsText = order.itemCount === 1
            ? order.firstItemName
            : `${order.firstItemName} + ${order.itemCount - 1} more`;

        const trimmedItems = itemsText.length > 30 ? itemsText.slice(0, 27) + '...' : itemsText;

        return (
            <tr key={order.id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300 whitespace-nowrap font-mono">
                    #{order.id}
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    {formattedDate}
                </td>
                <td className="p-2 sm:p-3">
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                            {statusIcon}
                            {order.displayStatus.charAt(0).toUpperCase() + order.displayStatus.slice(1)}
                        </span>
                    </div>
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">
                    <span title={itemsText}>{trimmedItems}</span>
                    {order.itemCount > 1 && (
                        <div className="text-xs text-gray-400 mt-1">
                            {order.itemCount} items
                        </div>
                    )}
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300 font-semibold whitespace-nowrap">
                    {formatPrice(order.total)}
                </td>
                <td className="p-2 sm:p-3 text-center">
                    <Link
                        href={`/account/orders/${order.id}`}
                        className="hover:text-[#00CAFF] duration-200 underline text-xs sm:text-sm whitespace-nowrap"
                    >
                        View
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div className="flex flex-col w-full gap-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="font-bold text-xl sm:text-2xl">My Orders</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{ordersWithStatus.length} order{ordersWithStatus.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-[#1e232b] border-y-2 border-[#1c2129]">
                        <tr>
                            <th className="w-[12%] p-3 text-sm font-semibold">Order ID</th>
                            <th className="w-[15%] p-3 text-sm font-semibold">Date</th>
                            <th className="w-[15%] p-3 text-sm font-semibold text-center">Status</th>
                            <th className="w-[35%] p-3 text-sm font-semibold">Items</th>
                            <th className="w-[13%] p-3 text-sm font-semibold">Total</th>
                            <th className="w-[10%] p-3 text-sm font-semibold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="border-b-2 border-[#1c2129]">
                        {displayOrders}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {ordersWithStatus.map((order) => {
                    const date = new Date(order.createdAt);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;

                    const statusColor = getStatusColor(order.displayStatus);
                    const statusIcon = getStatusIcon(order.displayStatus);

                    const itemsText = order.itemCount === 1
                        ? order.firstItemName
                        : `${order.firstItemName} + ${order.itemCount - 1} more items`;

                    return (
                        <div key={order.id} className="bg-[#1e232b] rounded-lg p-4 border border-[#2a3038]">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-sm font-medium text-gray-200">#{order.id}</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                                            {statusIcon}
                                            {order.displayStatus.charAt(0).toUpperCase() + order.displayStatus.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{formattedDate}</p>
                                </div>
                                <div className="ml-3 flex-shrink-0 text-right">
                                    <div className="font-semibold text-gray-200">{formatPrice(order.total)}</div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {itemsText}
                                </p>
                                {order.itemCount > 1 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {order.itemCount} items total
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Link
                                    href={`/account/orders/${order.id}`}
                                    className="text-[#00CAFF] hover:text-[#00a8d9] duration-200 underline text-sm font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
