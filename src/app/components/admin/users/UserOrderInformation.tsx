import { db } from '@/lib/db';
import { eq, and, inArray } from 'drizzle-orm';
import { cartTable, cartItemTable, productTable } from '@/db/schema';
import Link from 'next/link';
import { formatPrice } from '@/app/components/global/Atoms';
import { notFound, redirect } from 'next/navigation';
import { cancelOrder } from '@/app/actions/CartActions';
import { Box, Check, ChevronLeft, PackageCheck, X, AlertCircle } from 'lucide-react';

interface OrderItem {
    productId: number;
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
}

interface OrderDetails {
    id: number;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
    displayStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    total: number;
    itemCount: number;
}


export default async function OrderDetailsPage({ userId, orderId }: { userId: string, orderId: number }) {
    const [order] = await db
        .select({
            id: cartTable.id,
            createdAt: cartTable.createdAt,
            updatedAt: cartTable.updatedAt,
            userId: cartTable.userId,
            status: cartTable.status,
        })
        .from(cartTable)
        .where(
            and(
                eq(cartTable.id, orderId),
                inArray(cartTable.status, ['ordered', 'shipped', 'delivered', 'cancelled'])
            )
        );

    if (!order) {
        notFound();
    }
    if (order.userId !== userId) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-gray-400 text-lg">Not authorized</div>
            </div>
        )
    }

    const orderItems = await db
        .select({
            productId: cartItemTable.productId,
            productName: productTable.name,
            productPrice: productTable.price,
            quantity: cartItemTable.quantity,
        })
        .from(cartItemTable)
        .innerJoin(productTable, eq(cartItemTable.productId, productTable.id))
        .where(eq(cartItemTable.cartId, orderId));

    const items: OrderItem[] = orderItems.map(item => ({
        ...item,
        subtotal: item.productPrice * item.quantity,
    }));

    async function handleCancelOrder() {
        "use server";
        await cancelOrder(order.id);
        redirect("/account/orders");
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const orderDate = new Date(order.updatedAt);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const hoursSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);

    let displayStatus: OrderDetails['displayStatus'];
    if (order.status === 'cancelled') {
        displayStatus = 'cancelled';
    } else if (daysSinceOrder === 0) {
        displayStatus = 'pending';
    } else {
        displayStatus = 'shipped';
    }

    const orderDetails: OrderDetails = {
        id: order.id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        displayStatus,
        items,
        total,
        itemCount,
    };

    const canCancelOrder = hoursSinceOrder <= 24 && displayStatus === 'pending';

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'shipped':
                return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
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
                return <Box className="w-4 h-4" />;
            case 'cancelled':
                return <X className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} at ${hours}:${minutes}`;
    };

    const statusColor = getStatusColor(orderDetails.displayStatus);
    const statusIcon = getStatusIcon(orderDetails.displayStatus);

    return (
        <div className="flex flex-col w-full gap-4 sm:gap-6 overflow-hidden px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/account/orders"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-xl sm:text-2xl">Order #{orderDetails.id}</h1>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColor}`}>
                            {statusIcon}
                            {orderDetails.displayStatus.charAt(0).toUpperCase() + orderDetails.displayStatus.slice(1)}
                        </span>
                        {canCancelOrder && (
                            <form action={handleCancelOrder}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-red-500/30 
                                    bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel Order
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="text-sm text-gray-400">
                        <div>Ordered: {formatDate(orderDetails.updatedAt)}</div>
                    </div>
                </div>
            </div>

            {canCancelOrder && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-yellow-400 font-medium mb-1">Order can be cancelled</p>
                            <p className="text-gray-300">You can cancel this order within 24 hours of placement. After that, cancellation may not be possible.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1e232b] rounded-lg p-4 sm:p-6 border border-[#2a3038]">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
                    <div className="flex justify-between sm:block">
                        <div className="text-gray-400 text-sm">Total Items</div>
                        <div className="text-xl sm:text-2xl font-bold text-white">{orderDetails.itemCount}</div>
                    </div>

                    <div className="flex justify-between sm:block">
                        <div className="text-gray-400 text-sm">Unique Products</div>
                        <div className="text-xl sm:text-2xl font-bold text-white">{orderDetails.items.length}</div>
                    </div>

                    <div className="flex justify-between sm:block border-t sm:border-t-0 pt-4 sm:pt-0 border-[#2a3038]">
                        <div className="text-gray-400 text-sm">Total Amount</div>
                        <div className="text-xl sm:text-2xl font-bold text-[#00CAFF]">{formatPrice(orderDetails.total)}</div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-[#1e232b] rounded-lg border border-[#2a3038] overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-[#2a3038]">
                    <h2 className="text-lg font-semibold">Order Items</h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2129]">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold">Product</th>
                                <th className="text-center p-4 text-sm font-semibold">Quantity</th>
                                <th className="text-right p-4 text-sm font-semibold">Unit Price</th>
                                <th className="text-right p-4 text-sm font-semibold">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.items.map((item) => (
                                <tr key={item.productId} className="border-t border-[#2a3038] hover:bg-[#1c2129] transition-colors duration-200">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-200">{item.productName}</div>
                                        <div className="text-xs text-gray-400">ID: {item.productId}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="bg-[#2a3038] px-2 py-1 rounded text-sm font-medium">
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-medium">{formatPrice(item.productPrice)}</td>
                                    <td className="p-4 text-right font-bold text-[#00CAFF]">{formatPrice(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[#1c2129] border-t-2 border-[#2a3038]">
                            <tr>
                                <td colSpan={3} className="p-4 text-right font-semibold">Total:</td>
                                <td className="p-4 text-right font-bold text-xl text-[#00CAFF]">{formatPrice(orderDetails.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-[#2a3038]">
                    {orderDetails.items.map((item) => (
                        <div key={item.productId} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-200 leading-tight">{item.productName}</h3>
                                    <p className="text-xs text-gray-400 mt-1">ID: {item.productId}</p>
                                </div>
                                <div className="ml-3 text-right flex-shrink-0">
                                    <div className="font-bold text-[#00CAFF]">{formatPrice(item.subtotal)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-gray-400">
                                    Quantity: <span className="text-white font-medium">{item.quantity}</span>
                                </div>
                                <div className="text-gray-400 text-right">
                                    Unit Price: <span className="text-white font-medium">{formatPrice(item.productPrice)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="p-4 bg-[#1c2129]">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-lg">Total:</span>
                            <span className="font-bold text-xl text-[#00CAFF]">{formatPrice(orderDetails.total)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Status */}
            <div className="bg-[#1e232b] rounded-lg p-4 sm:p-6 border border-[#2a3038]">
                <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${['pending', 'processing', 'shipped', 'delivered'].includes(orderDetails.displayStatus)
                        ? 'border-green-500/30 bg-green-500/20 text-green-400'
                        : 'border-gray-500/30 bg-gray-500/20 text-gray-400'
                        }`}>
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Order Placed</span>
                    </div>


                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${['shipped', 'delivered'].includes(orderDetails.displayStatus)
                        ? 'border-green-500/30 bg-green-500/20 text-green-400'
                        : 'border-gray-500/30 bg-gray-500/20 text-gray-400'
                        }`}>
                        <Box className="w-4 h-4" />
                        <span className="text-sm font-medium">Shipped</span>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${orderDetails.displayStatus === 'delivered'
                        ? 'border-green-500/30 bg-green-500/20 text-green-400'
                        : 'border-gray-500/30 bg-gray-500/20 text-gray-400'
                        }`}>
                        <PackageCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Delivered</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
