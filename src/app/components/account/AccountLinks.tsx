"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { User, Heart, MapPin, Star, ShoppingBag, Shield } from "lucide-react";

const LINKS = [
    { name: "Account Information", value: "account", href: "/account", icon: User },
    { name: "Wishlist", value: "wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Address Book", value: "address", href: "/account/address", icon: MapPin },
    { name: "Reviews", value: "reviews", href: "/account/reviews", icon: Star },
    { name: "Orders", value: "orders", href: "/account/orders", icon: ShoppingBag },
    { name: "Admin Panel", value: "admin", href: "/admin", icon: Shield }
];

export default function AccountLinks() {
    const router = useRouter();
    const pathname = usePathname();

    // Get current selection based on pathname
    const getCurrentSelection = useCallback(() => {
        if (pathname === "/account") return "account";
        if (pathname === "/admin") return "admin";

        const pathParts = pathname.split("/").filter(Boolean);
        if (pathParts[0] === "admin") {
            // For admin paths like /admin/users/123/wishlist, get the last part
            return pathParts[3] || "account";
        }
        // For account paths like /account/wishlist, get the second part
        return pathParts[1] || "account";
    }, [pathname]);

    const [selectedValue, setSelectedValue] = useState(() => getCurrentSelection());

    // Update selection when pathname changes
    useEffect(() => {
        const newSelection = getCurrentSelection();
        setSelectedValue(newSelection);
    }, [getCurrentSelection]);

    // Determine if we're in admin context and get userId if present
    const isAdminContext = pathname.startsWith("/admin");
    const userId = isAdminContext ? pathname.split("/")[3] : null;

    // Generate appropriate links based on context
    const getActiveLinks = () => {
        if (!isAdminContext) return LINKS;

        // For admin context, exclude admin panel link and adjust hrefs
        return LINKS.slice(0, -1).map(link => ({
            ...link,
            href: userId ? `/admin/users/${userId}${link.href.replace("/account", "")}` : link.href
        }));
    };

    const activeLinks = getActiveLinks();
    const currentLink = activeLinks.find(link => link.value === selectedValue) || activeLinks[0];
    const CurrentIcon = currentLink.icon;

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        const selectedLink = activeLinks.find(link => link.value === newValue);

        if (selectedLink && newValue !== selectedValue) {
            // Immediately update the selection state for instant UI feedback
            setSelectedValue(newValue);
            router.push(selectedLink.href);
        }
    };

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
                    {activeLinks.map((link) => (
                        <option
                            key={link.value}
                            value={link.value}
                            className="bg-[#393e46] text-white py-2"
                        >
                            {link.name}
                        </option>
                    ))}
                </select>
                {activeLinks.map((link) => (
                    <Link prefetch key={link.value} href={link.href} className="hidden" />
                ))}
            </div>
        </div>
    );
}
