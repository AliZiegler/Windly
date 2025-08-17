import SignOut from "@/app/components/global/SignOut";
import Link from "next/link";
import {
    User,
    Heart,
    MapPin,
    Star,
    ShoppingBag,
    Shield
} from "lucide-react";

export default function AccountSideBar() {
    const links = [
        { name: "Account Information", href: "/account", icon: User },
        { name: "Wishlist", href: "/account/wishlist", icon: Heart },
        { name: "Address Book", href: "/account/address", icon: MapPin },
        { name: "Reviews", href: "/account/reviews", icon: Star },
        { name: "Orders", href: "/account/orders", icon: ShoppingBag },
        { name: "Admin Panel", href: "/admin", icon: Shield }
    ];

    const liLinks = links.map((link) => {
        const IconComponent = link.icon;
        return (
            <li key={link.name} className="border-b-1 border-gray-400 py-3 hover:font-extrabold transition-all 
                duration-200 hover:bg-gray-800/30 hover:px-2 rounded-md">
                <Link
                    href={link.href}
                    prefetch
                    className="flex items-center gap-3 text-[#FCECDD] hover:text-white transition-colors duration-200"
                >
                    <IconComponent size={18} className="flex-shrink-0" />
                    <span>{link.name}</span>
                </Link>
            </li>
        );
    });

    return (
        <div className="w-72 min-h-[400px] text-[#FCECDD] border-r-1 border-gray-400 pr-3">
            <div className="mb-6">
                <h2 className="text-2xl mb-2 font-semibold flex items-center gap-2">
                    <User size={24} className="text-blue-400" />
                    Welcome
                </h2>
            </div>

            <nav>
                <ul className="space-y-1">
                    {liLinks}
                </ul>
            </nav>

            <div className="mt-6">
                <SignOut className="cursor-pointer h-8 w-36 bg-red-500 hover:bg-red-500 rounded-md flex items-center 
                 gap-3 pl-1 transition-colors duration-200 text-white font-medium" />
            </div>

            <hr className="mt-6 border-gray-400" />
        </div>
    );
}
