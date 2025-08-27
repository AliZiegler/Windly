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
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: PackageSearch },
        { name: "Users", href: "/admin/users", icon: UserSearch },
        { name: "Reviews", href: "/admin/reviews", icon: UserStar },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBasket },
        { name: "Addresses", href: "/admin/addresses", icon: MapPinPen },
        { name: "Your Account", href: "/account", icon: User }
    ];

    const liLinks = links.map((link) => {
        const IconComponent = link.icon;
        return (
            <li
                key={link.name}
                className="border-b border-gray-400 py-3 transition-all duration-200 rounded-md
                 hover:font-extrabold hover:bg-gray-800/30 hover:px-2
                 focus:font-extrabold focus:bg-gray-800/30 focus:px-2
                 active:font-extrabold active:bg-gray-800/30 active:px-2"
            >
                <Link
                    href={link.href}
                    prefetch
                    className="flex items-center gap-3 text-[#FCECDD] hover:text-white focus:text-white transition-colors duration-200"
                >
                    <IconComponent size={18} className="flex-shrink-0" />
                    <span>{link.name}</span>
                </Link>
            </li>
        );
    });
    const spanLinks = links.slice(0, 5).map((link, index) => {
        const IconComponent = link.icon;
        const mobileIcons = [TrendingUp, Package, Users, ShoppingCart, MessageSquare];
        const MobileIcon = mobileIcons[index] || IconComponent;
        return (
            <Link
                prefetch
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${index === 0 ? 'text-teal-400' : 'text-slate-400 hover:text-teal-400'
                    }`}
            >
                <MobileIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">{link.name}</span>
            </Link>
        );
    })

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 text-[#FCECDD] border-r border-gray-400">
                <aside className="sticky top-0 h-screen pr-3 pt-3 z-10">
                    <div className="mb-6">
                        <h2 className="text-2xl mb-2 font-semibold flex items-center gap-2">
                            <Shield size={24} className="text-blue-400" />
                            Welcome
                        </h2>
                    </div>
                    <nav>
                        <ul className="space-y-1">
                            {liLinks}
                        </ul>
                    </nav>
                </aside>
            </div>
            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#272d36] border-t border-gray-700 z-50">
                <div className="flex justify-around py-2">
                    {spanLinks}
                </div>
            </div>
        </>
    );
}
