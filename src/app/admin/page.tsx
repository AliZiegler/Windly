import { auth } from "@/auth";
import { isAdmin } from "@/app/actions/UserActions";
import {
    Package,
    Users,
    ShoppingCart,
    Star,
    MapPin,
    MessageSquare,
    TrendingUp,
    Settings,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";

export default async function AdminPanel() {
    // Mock authentication and admin check for demonstration purposes
    // In a real application, these would be handled by your backend
    const session = { user: { id: "12345" } }; // Mock session
    const userId = session?.user?.id || "null";
    const isUserAdmin = true; // Mock admin status

    if (!userId || !isUserAdmin) {
        return (
            <main className="text-center text-4xl mt-10 bg-[#222831] text-white min-h-screen">
                <h1 className="text-[100px] mb-20">🫨</h1>
                <h2 className="mb-10">Stop Right There!!</h2>
                <p>This Page Is Only Accessible To Mr. Ziegler</p>
            </main>
        );
    }

    // Statistics data
    const stats = [
        {
            title: "Total Products",
            value: "1,234",
            change: "+12%",
            icon: Package,
            color: "text-green-400",
        },
        {
            title: "Total Users",
            value: "5,678",
            change: "+8%",
            icon: Users,
            color: "text-purple-400",
        },
        {
            title: "Orders",
            value: "892",
            change: "+15%",
            icon: ShoppingCart,
            color: "text-cyan-400",
        }, // Changed from blue to cyan
        {
            title: "Reviews",
            value: "2,341",
            change: "+5%",
            icon: Star,
            color: "text-yellow-400",
        },
    ];

    // Recent products data
    const recentProducts = [
        {
            id: 1,
            name: "EchoSpace Wireless Earbuds",
            category: "Electronics",
            price: "$3.59",
            stock: 45,
            status: "Active",
        },
        {
            id: 2,
            name: "AeroBook Pro Laptop",
            category: "Computers",
            price: "$174.79",
            stock: 12,
            status: "Active",
        },
        {
            id: 3,
            name: "TerraTrail Hiking Backpack",
            category: "Outdoor",
            price: "$774.39",
            stock: 0,
            status: "Out of Stock",
        },
        {
            id: 4,
            name: "BlendMaster Immersion Blender",
            category: "Kitchen",
            price: "$1,299.99",
            stock: 8,
            status: "Active",
        },
    ];

    // Recent users data
    const recentUsers = [
        {
            id: 1,
            name: "John Smith",
            email: "john@example.com",
            role: "user",
            joined: "2024-08-15",
        },
        {
            id: 2,
            name: "Sarah Johnson",
            email: "sarah@example.com",
            role: "seller",
            joined: "2024-08-14",
        },
        {
            id: 3,
            name: "Mike Brown",
            email: "mike@example.com",
            role: "user",
            joined: "2024-08-13",
        },
        {
            id: 4,
            name: "Emma Davis",
            email: "emma@example.com",
            role: "user",
            joined: "2024-08-12",
        },
    ];

    return (
        <div className="min-h-screen bg-[#222831] text-white font-sans">
            {/* Header (Navbar) */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-[#272d36] min-h-screen hidden lg:block">
                    <nav className="p-4 sticky top-0 z-10">
                        <ul className="space-y-2">
                            <li>
                                {/* Active link - changed from blue to teal */}
                                <div className="w-full flex items-center px-3 py-2 rounded-lg bg-teal-600 text-white">
                                    <TrendingUp className="w-5 h-5 mr-3" />
                                    Dashboard
                                </div>
                            </li>
                            <li>
                                <div className="w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                                    <Package className="w-5 h-5 mr-3" />
                                    Products
                                </div>
                            </li>
                            <li>
                                <div className="w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                                    <Users className="w-5 h-5 mr-3" />
                                    Users
                                </div>
                            </li>
                            <li>
                                <div className="w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                                    <ShoppingCart className="w-5 h-5 mr-3" />
                                    Orders
                                </div>
                            </li>
                            <li>
                                <div className="w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                                    <MessageSquare className="w-5 h-5 mr-3" />
                                    Reviews
                                </div>
                            </li>
                            <li>
                                <div className="w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                                    <MapPin className="w-5 h-5 mr-3" />
                                    Addresses
                                </div>
                            </li>
                            <li>
                                <div className="w-full flex items-center px-3 py-2 rounded-lg text-slate-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                                    <Settings className="w-5 h-5 mr-3" />
                                    Settings
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Mobile Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#393e46] border-t border-gray-700">
                    <div className="flex justify-around py-2">
                        {/* Active link - changed from blue to teal */}
                        <div className="flex flex-col items-center p-2 rounded-lg text-teal-400">
                            <TrendingUp className="w-5 h-5 mb-1" />
                            <span className="text-xs">Dashboard</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg text-slate-400 cursor-pointer">
                            <Package className="w-5 h-5 mb-1" />
                            <span className="text-xs">Products</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg text-slate-400 cursor-pointer">
                            <Users className="w-5 h-5 mb-1" />
                            <span className="text-xs">Users</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg text-slate-400 cursor-pointer">
                            <ShoppingCart className="w-5 h-5 mb-1" />
                            <span className="text-xs">Orders</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg text-slate-400 cursor-pointer">
                            <MessageSquare className="w-5 h-5 mb-1" />
                            <span className="text-xs">Reviews</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
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
                                        className="bg-[#393e46] rounded-lg p-6 border border-gray-700"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <Icon className={`w-8 h-8 ${stat.color}`} />
                                            <span className="text-green-400 text-sm font-medium">
                                                {stat.change}
                                            </span>
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
                                        {recentProducts.map((product) => (
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
                                        ))}
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
                                        {recentUsers.map((user) => (
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
                                                                ? "bg-orange-900 text-orange-300" // Changed from blue to orange
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
                                        ))}
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
                                {/* Button - changed from blue to teal */}
                                <button className="mt-4 sm:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center">
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
                                                className="pl-10 pr-4 py-2 w-full bg-[#393e46] border border-gray-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500" // Changed from blue to teal
                                            />
                                        </div>
                                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-800">
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
                                        <tbody className="divide-y divide-gray-700">
                                            {recentProducts.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-800">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gray-600 rounded-lg mr-3"></div>
                                                            <div>
                                                                <p className="text-white font-medium">
                                                                    {product.name}
                                                                </p>
                                                                <p className="text-slate-400 text-sm">
                                                                    ID: {product.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {product.category}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {product.price}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {product.stock}
                                                    </td>
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
                                                            {/* Icon color - changed from blue to teal */}
                                                            <button className="text-teal-400 hover:text-teal-300">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-slate-400 hover:text-slate-300">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button className="text-red-400 hover:text-red-300">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
