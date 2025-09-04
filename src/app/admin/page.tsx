import { db } from "@/lib/db";
import { productTable, userTable, cartTable, cartItemTable } from "@/db/schema";
import { desc, sql, inArray } from "drizzle-orm";
import Link from "next/link";
import ProductsManagement from "../components/admin/dashboard/ProductsManagement";
import { Package, Users, ShoppingCart, Star, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
    const products = await db.select().from(productTable).orderBy(desc(productTable.id));
    const users = await db.select().from(userTable).orderBy(desc(userTable.createdAt));

    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(productTable);
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(userTable);

    let orderCount = { count: 0 };
    let totalRevenue = 0;
    try {
        [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(cartTable)
            .where(inArray(cartTable.status, ['ordered', 'shipped', 'delivered', 'cancelled']));
        const [revenueResult] = await db
            .select({
                total: sql<number>`sum(${cartItemTable.quantity} * ${productTable.price} * (1 - ${productTable.discount} / 100))`
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
        { title: "Total Products", value: productCount.count.toString(), icon: Package, color: "blue" },
        { title: "Total Users", value: userCount.count.toString(), icon: Users, color: "green" },
        { title: "Total Orders", value: orderCount.count.toString(), icon: ShoppingCart, color: "purple" },
        { title: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "yellow" },
    ];

    const divStats = stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
            <div key={index} className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038] min-w-0">
                <div className="flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                        <p className="text-gray-400 text-sm truncate">{stat.title}</p>
                        <p className="text-2xl font-bold text-white truncate">{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-500/20 rounded-lg`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                </div>
            </div>
        );
    });

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

    const displayRecentProducts = recentProducts.slice(0, 4).map((product) => (
        <div key={product.id} className="w-full p-3 h-full flex items-center justify-between odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200 min-w-0">
            <div className="min-w-0">
                <p className="text-white font-medium truncate">{product.name}</p>
                <p className="text-slate-400 text-sm truncate">{product.category} • {product.price}</p>
            </div>
            <div className="text-right min-w-0">
                <p className={`text-sm font-medium ${product.status === "Active" ? "text-green-400" : "text-red-400"}`}>
                    {product.status}
                </p>
                <p className="text-slate-400 text-sm truncate">Stock: {product.stock}</p>
            </div>
        </div>
    ));

    const displayRecentUsers = recentUsers.slice(0, 4).map((user) => (
        <div key={user.id} className="w-full p-3 h-full flex items-center justify-between odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200 min-w-0">
            <div className="min-w-0">
                <p className="text-white font-medium truncate">{user.name}</p>
                <p className="text-slate-400 text-sm truncate">{user.email}</p>
            </div>
            <div className="text-right min-w-0">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-red-900 text-red-300" : user.role === "seller" ? "bg-orange-900 text-orange-300" : "bg-green-900 text-green-300"}`}>
                    {user.role}
                </span>
                <p className="text-slate-400 text-sm mt-1 truncate">{user.joined}</p>
            </div>
        </div>
    ));

    const quickActions = [
        { name: "Products Management", href: "/admin/products", p: "Add, edit, or remove products", icon: Package, iconColor: "text-blue-400" },
        { name: "User Management", href: "/admin/users", p: "View and manage users", icon: Users, iconColor: "text-green-400" },
        { name: "Orders Management", href: "/admin/orders", p: "Track and manage orders", icon: ShoppingCart, iconColor: "text-purple-400" },
        { name: "Reviews Management", href: "/admin/reviews", p: "Monitor product reviews", icon: Star, iconColor: "text-yellow-400" },
    ];

    const quickActionsButtons = quickActions.map((action) => {
        const ActionIcon = action.icon;
        return (
            <button key={action.name} className="bg-midnight duration-200 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 text-left transition-colors min-w-0">
                <Link prefetch href={action.href}>
                    <ActionIcon className={`w-8 h-8 mb-3 ${action.iconColor}`} />
                    <h4 className="text-white font-medium mb-1 truncate">{action.name}</h4>
                    <p className="text-slate-400 text-sm truncate">{action.p}</p>
                </Link>
            </button>
        );
    });

    return (
        <div className="min-h-screen bg-[#222831] text-white font-sans">
            <div className="flex flex-col lg:flex-row">
                <main className="flex-1 min-w-0 p-4 lg:p-8 pb-20 lg:pb-8">
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2 truncate">Dashboard</h2>
                            <p className="text-slate-400 truncate">Welcome back, Mr. Ziegler</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {divStats}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-[#1e232b] max-h-[363px] rounded-lg border border-gray-700 min-w-0">
                                <div className="p-6 border-b border-gray-700">
                                    <h3 className="text-xl font-semibold text-white truncate">Recent Products</h3>
                                </div>
                                <div className="max-h-[286px] overflow-auto">
                                    {recentProducts.length > 0 ? displayRecentProducts : <p className="text-slate-400 text-center py-4">No products found</p>}
                                </div>
                            </div>

                            <div className="bg-[#1e232b] max-h-[363px] rounded-lg border border-gray-700 min-w-0">
                                <div className="p-6 border-b border-gray-700">
                                    <h3 className="text-xl font-semibold text-white truncate">Recent Users</h3>
                                </div>
                                <div className="max-h-[286px] overflow-auto">
                                    {recentUsers.length > 0 ? displayRecentUsers : <p className="text-slate-400 text-center py-4">No users found</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 min-w-0">
                                <div className="min-w-0">
                                    <h3 className="text-2xl font-bold text-white mb-2 truncate">Product Management</h3>
                                    <p className="text-slate-400 truncate">Manage your product inventory</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/admin/products/new"
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                    >
                                        <Package className="w-4 h-4 mr-2" />
                                        Add Product
                                    </Link>
                                </div>
                            </div>
                            <ProductsManagement recentProducts={recentProducts} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActionsButtons}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
