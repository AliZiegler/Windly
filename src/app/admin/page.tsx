import { db } from "@/lib/db";
import { productTable, userTable, cartTable, cartItemTable } from "@/db/schema";
import { desc, sql, inArray } from "drizzle-orm";
import Link from "next/link";
import ProductsManagement from "../components/admin/dashboard/ProductsManagement";
import {
    Package,
    Users,
    ShoppingCart,
    Star,
    Plus,
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
    const divStats = stats.map((stat, index) => {
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
    })

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
    const displayRecentProducts = recentProducts.slice(0, 5).map((product) => (
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

    const displayRecentUsers = recentUsers.slice(0, 5).map((user) => (
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

    const quickActions = [
        { name: "Products Management", href: "/admin/products", p: "Add, edit, or remove products", icon: Package, iconColor: "text-blue-400" },
        { name: "User Management", href: "/admin/users", p: "View and manage users", icon: Users, iconColor: "text-green-400" },
        { name: "Orders Management", href: "/admin/orders", p: "Track and manage orders", icon: ShoppingCart, iconColor: "text-purple-400" },
        { name: "Reviews Management", href: "/admin/reviews", p: "Monitor product reviews", icon: Star, iconColor: "text-yellow-400" },
    ]
    const quickActionsButtons = quickActions.map((action) => {
        const ActionIcon = action.icon;
        return (
            <button key={action.name} className="bg-[#393e46] hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors">
                <Link prefetch href={action.href}>
                    <ActionIcon className={`w-8 h-8 mb-3 ${action.iconColor}`} />
                    <h4 className="text-white font-medium mb-1">{action.name}</h4>
                    <p className="text-slate-400 text-sm">{action.p}</p>
                </Link>
            </button>
        )
    })

    return (
        <div className="min-h-screen bg-[#222831] text-white font-sans">
            <div className="flex">
                <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                            <p className="text-slate-400">Welcome back, Mr. Ziegler</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {divStats}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-[#393e46] rounded-lg border border-gray-700">
                                <div className="p-6 border-b border-gray-700">
                                    <h3 className="text-xl font-semibold text-white">
                                        Recent Products
                                    </h3>
                                </div>
                                <div className="p-6 bg-[#2e3238]">
                                    <div className="space-y-4">
                                        {recentProducts.length > 0 ? (
                                            displayRecentProducts
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">No products found</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#2e3238] rounded-lg border border-gray-700">
                                <div className="p-6 bg-[#393e46] border-b border-gray-700">
                                    <h3 className="text-xl font-semibold text-white">
                                        Recent Users
                                    </h3>
                                </div>
                                <div className="p-6 bg-[#2e3238]">
                                    <div className="space-y-4">
                                        {recentUsers.length > 0 ? (
                                            displayRecentUsers
                                        ) : (
                                            <p className="text-slate-400 text-center py-4">No users found</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

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
                            <ProductsManagement recentProducts={recentProducts} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActionsButtons}
                        </div>
                    </div>
                </main >
            </div >
        </div >
    );
}
