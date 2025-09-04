import Link from "next/link";
import {
    LayoutDashboard,
    MapPinPen,
    PackageSearch,
    Shield,
    ShoppingBasket,
    User,
    UserSearch,
    UserStar,
    Package,
    Users,
    ShoppingCart,
    MessageSquare,
    TrendingUp,
} from "lucide-react";

export default function AdminSidebar() {
    const links = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, mobileIcon: TrendingUp, shortName: "Home" },
        { name: "Products", href: "/admin/products", icon: PackageSearch, mobileIcon: Package, shortName: "Products" },
        { name: "Users", href: "/admin/users", icon: UserSearch, mobileIcon: Users, shortName: "Users" },
        { name: "Reviews", href: "/admin/reviews", icon: UserStar, mobileIcon: MessageSquare, shortName: "Reviews" },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBasket, mobileIcon: ShoppingCart, shortName: "Orders" },
        { name: "Addresses", href: "/admin/addresses", icon: MapPinPen },
        { name: "Your Account", href: "/account", icon: User }
    ];

    const liLinks = links.map((link) => {
        const IconComponent = link.icon;
        return (
            <li key={link.name} className="border-b border-gray-400 py-2">
                <Link
                    href={link.href}
                    prefetch
                    className="flex items-center gap-3 text-[#FCECDD] hover:text-white p-2 rounded hover:bg-gray-800/30 transition-all duration-200"
                >
                    <IconComponent size={18} className="flex-shrink-0" />
                    <span className="truncate">{link.name}</span>
                </Link>
            </li>
        );
    });

    const spanLinks = links.map((link) => {
        const MobileIcon = link.mobileIcon || link.icon;
        return (
            <Link
                prefetch
                key={link.name}
                href={link.href}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all duration-200 min-w-0 flex-1 
                group text-slate-400 hover:text-teal-400 hover:bg-teal-400/5 active:bg-teal-400/10"
            >
                <MobileIcon className="w-6 h-6 mb-1.5 flex-shrink-0 group-active:scale-95 transition-transform" />
                <span className="text-xs font-medium truncate w-full text-center leading-tight">
                    {link.shortName || link.name}
                </span>
            </Link>
        );
    });

    return (
        <>
            {/* Desktop Sidebar - Only show on large screens */}
            <div className="hidden xl:block w-64 text-[#FCECDD] border-r border-gray-400 flex-shrink-0">
                <aside className="sticky top-0 h-screen p-3 overflow-y-auto">
                    <div className="mb-6">
                        <h2 className="text-xl mb-2 font-semibold flex items-center gap-2">
                            <Shield size={20} className="text-blue-400 flex-shrink-0" />
                            <span className="truncate">Welcome</span>
                        </h2>
                    </div>
                    <nav>
                        <ul className="space-y-1">
                            {liLinks}
                        </ul>
                    </nav>
                </aside>
            </div>

            {/* Mobile Bottom Navigation - Improved */}
            <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#272d36]/95 backdrop-blur-sm border-t border-gray-600 z-50 safe-area-pb">
                <div className="flex justify-around items-center px-2 py-1 w-full mx-auto">
                    {spanLinks}
                </div>
                {/* Add safe area padding for devices with home indicator */}
                <div className="h-safe-area-inset-bottom bg-[#272d36]/95"></div>
            </div>
        </>
    );
}
