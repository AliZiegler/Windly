import { db } from "@/lib/db";
import { productTable, userTable, cartTable, cartItemTable } from "@/db/schema";
import { desc, sql, inArray } from "drizzle-orm";
import Link from "next/link";
import {
    Package,
    Users,
    ShoppingCart,
    Star,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    DollarSign,
} from "lucide-react";

export default async function AdminDashboard() {
    const products = await db.select().from(productTable).orderBy(desc(productTable.id));
    const users = await db.select().from(userTable).orderBy(desc(userTable.createdAt));

    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(productTable);
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(userTable);

    let orderCount = { count: 0 };
    let totalRevenue = 0;

    try {
        [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(cartTable).
            where(inArray(cartTable.status, ['ordered', 'shipped', 'delivered', 'cancelled']));

        const [revenueResult] = await db
            .select({
                total: sql<number>`sum(${cartItemTable.quantity} * ${productTable.price})`
            })
            .from(cartTable)
            .innerJoin(cartItemTable, sql`${cartTable.id} = ${cartItemTable.cartId}`)
            .innerJoin(productTable, sql`${cartItemTable.productId} = ${productTable.id}`)
            .where(inArray(cartTable.status, ['ordered', 'shipped', 'delivered']));

        totalRevenue = revenueResult?.total || 0;
    } catch (error) {
        console.log("Some tables not available yet:", error);
    }

    const stats = [
        {
            title: "Total Products",
            value: productCount.count.toString(),
            icon: Package,
            color: "text-blue-400",
        },
        {
            title: "Total Users",
            value: userCount.count.toString(),
            icon: Users,
            color: "text-green-400",
        },
        {
            title: "Total Orders",
            value: orderCount.count.toString(),
            icon: ShoppingCart,
            color: "text-purple-400",
        },
        {
            title: "Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-yellow-400",
        },
    ];

    const recentProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || "General",
        price: `$${product.price}`,
        stock: product.stock?.toString() || "N/A",
        status: product.stock && product.stock > 0 ? "Active" : "Out of Stock",
    }));


    const recentUsers = users.map(user => ({
        id: user.id,
        name: user.name || "Unknown User",
        email: user.email || "No email",
        role: user.role || "user",
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown",
    }));

    return (
        <div className="min-h-screen bg-[#222831] text-white font-sans">
            <div className="flex">
                <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                            <p className="text-slate-400">Welcome back, Mr. Ziegler</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-[#393e46] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <Icon className={`w-8 h-8 ${stat.color}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {stat.value}
                                        </h3>
                                        <p className="text-slate-400 text-sm">{stat.title}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Recent Products */}
                            <div className="bg-[#393e46] rounded-lg border border-gray-700">
                                <div className="p-6 border-b border-gray-700">
                                    <h3 className="text-xl font-semibold text-white">
                                        Recent Products
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentProducts.length > 0 ? (
                                            recentProducts.slice(0, 5).map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-slate-400 text-sm">
                                                            {product.category} • {product.price}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p
                                                            className={`text-sm font-medium ${product.status === "Active"
                                                                ? "text-green-400"
                                                                : "text-red-400"
                                                                }`}
                                                        >
                                                            {product.status}
                                                        </p>
                                                        <p className="text-slate-400 text-sm">
                                                            Stock: {product.stock}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">No products found</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Users */}
                            <div className="bg-[#393e46] rounded-lg border border-gray-700">
                                <div className="p-6 border-b border-gray-700">
                                    <h3 className="text-xl font-semibold text-white">
                                        Recent Users
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {recentUsers.length > 0 ? (
                                            recentUsers.slice(0, 5).map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="text-white font-medium">{user.name}</p>
                                                        <p className="text-slate-400 text-sm">{user.email}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                                                                ? "bg-red-900 text-red-300"
                                                                : user.role === "seller"
                                                                    ? "bg-orange-900 text-orange-300"
                                                                    : "bg-green-900 text-green-300"
                                                                }`}
                                                        >
                                                            {user.role}
                                                        </span>
                                                        <p className="text-slate-400 text-sm mt-1">
                                                            {user.joined}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">No users found</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Management Section */}
                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Product Management
                                    </h3>
                                    <p className="text-slate-400">Manage your product inventory</p>
                                </div>
                                <button className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Product
                                </button>
                            </div>

                            <div className="bg-[#393e46] rounded-lg border border-gray-700">
                                <div className="p-6 border-b border-gray-700">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                className="pl-10 pr-4 py-2 w-full bg-[#222831] border border-gray-600 rounded-lg text-white 
                                                placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            <div className="min-w-full">
                                                <div className="max-h-[600px] overflow-y-auto">
                                                    <table className="min-w-full divide-y divide-gray-700">
                                                        <thead className="bg-gray-800 sticky top-0 z-10">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                                    Product
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                                    Category
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                                    Price
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                                    Stock
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                                                    Actions
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-gray-800">
                                                            {recentProducts.length > 0 ? (
                                                                recentProducts.map((product) => (
                                                                    <tr key={product.id} className="hover:bg-gray-800 transition-colors">
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center">
                                                                                <div
                                                                                    className="w-10 h-10 bg-gray-600 rounded-lg mr-3 flex items-center justify-center">
                                                                                    <Package className="w-5 h-5 text-gray-400" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-white font-medium">
                                                                                        {product.name}
                                                                                    </p>
                                                                                    <p className="text-slate-400 text-sm">ID: {product.id}</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-slate-300">{product.category}</td>
                                                                        <td className="px-6 py-4 text-slate-300">{product.price}</td>
                                                                        <td className="px-6 py-4 text-slate-300">{product.stock}</td>
                                                                        <td className="px-6 py-4">
                                                                            <span
                                                                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.status === "Active"
                                                                                    ? "bg-green-900 text-green-300"
                                                                                    : "bg-red-900 text-red-300"
                                                                                    }`}
                                                                            >
                                                                                {product.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center space-x-2">
                                                                                <button className="text-teal-400 hover:text-teal-300 transition-colors">
                                                                                    <Eye className="w-4 h-4" />
                                                                                </button>
                                                                                <button className="text-slate-400 hover:text-slate-300 transition-colors">
                                                                                    <Edit className="w-4 h-4" />
                                                                                </button>
                                                                                <button className="text-red-400 hover:text-red-300 transition-colors">
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                                                        No products found
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="bg-[#393e46] hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors">
                                <Link prefetch href="/admin/products">
                                    <Package className="w-8 h-8 text-blue-400 mb-3" />
                                    <h4 className="text-white font-medium mb-1">Manage Products</h4>
                                    <p className="text-slate-400 text-sm">Add, edit, or remove products</p>
                                </Link>
                            </button>
                            <button className="bg-[#393e46] hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors">
                                <Link prefetch href="/admin/orders">
                                    <Users className="w-8 h-8 text-green-400 mb-3" />
                                    <h4 className="text-white font-medium mb-1">User Management</h4>
                                    <p className="text-slate-400 text-sm">View and manage users</p>
                                </Link>
                            </button>
                            <button className="bg-[#393e46] hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors">
                                <Link prefetch href="/admin/carts">
                                    <ShoppingCart className="w-8 h-8 text-purple-400 mb-3" />
                                    <h4 className="text-white font-medium mb-1">Orders</h4>
                                    <p className="text-slate-400 text-sm">Track and manage orders</p>
                                </Link>
                            </button>
                            <button className="bg-[#393e46] hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors">
                                <Link prefetch href="/admin/reviews">
                                    <Star className="w-8 h-8 text-yellow-400 mb-3" />
                                    <h4 className="text-white font-medium mb-1">Reviews</h4>
                                    <p className="text-slate-400 text-sm">Monitor product reviews</p>
                                </Link>
                            </button>
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
}
