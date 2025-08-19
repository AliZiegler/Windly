"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    User,
    Heart,
    MapPin,
    Star,
    ShoppingBag,
    Shield
} from "lucide-react";

export default function AccountLinks() {
    const router = useRouter();
    const pathname = usePathname();
    const secondPath = pathname.split("/")[2];

    const links = [
        { name: "Account Information", value: "account", href: "/account", icon: User },
        { name: "Wishlist", value: "wishlist", href: "/account/wishlist", icon: Heart },
        { name: "Address Book", value: "address", href: "/account/address", icon: MapPin },
        { name: "Reviews", value: "reviews", href: "/account/reviews", icon: Star },
        { name: "Orders", value: "orders", href: "/account/orders", icon: ShoppingBag },
        { name: "Admin Panel", value: "admin", href: "/admin", icon: Shield }
    ];

    const [selectedValue, setSelectedValue] = useState(() => {
        if (pathname === "/account") return "account";
        if (pathname.startsWith("/admin")) return "admin";
        return secondPath || "account";
    });

    useEffect(() => {
        const getCurrentSelection = () => {
            if (pathname === "/account") return "account";
            if (pathname.startsWith("/admin")) return "admin";
            return secondPath || "account";
        };
        setSelectedValue(getCurrentSelection());
    }, [pathname, secondPath]);

    const currentLink = links.find(link => link.value === selectedValue) || links[0];
    const CurrentIcon = currentLink.icon;

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const newValue = event.target.value;
        if (newValue === selectedValue) return;

        setSelectedValue(newValue);

        const selectedLink = links.find(link => link.value === newValue);
        if (selectedLink) {
            router.push(selectedLink.href);
        }
    }

    return (
        <div className="w-80 max-w-[90vw]">
            <div className="relative">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <CurrentIcon size={18} className="text-blue-400" />
                    <span className="text-white font-medium">{currentLink.name}</span>
                </div>
                <select
                    className="w-full h-12 px-4 bg-[#393e46] text-white border border-gray-600 rounded-lg cursor-pointer 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={selectedValue}
                    onChange={handleChange}
                >
                    {links.map((link) => (
                        <option
                            key={link.value}
                            value={link.value}
                            className="bg-[#393e46] text-white py-2"
                        >
                            {link.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
