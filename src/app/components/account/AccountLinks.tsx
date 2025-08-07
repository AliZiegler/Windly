"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
export default function AccontLinks() {
    const router = useRouter();
    const pathname = usePathname();
    const secondpath = pathname.split("/")[2];
    const selected = secondpath || "account";
    const [path, setPath] = useState(selected);
    const links = ["Account Information", "Wishlist", "Address", "Reviews", "Orders"];
    const optionLinks = links.map((link) => (
        <option key={link} value={link} className="bg-[#1e232b]">{link}</option>
    ))
    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const newPath = event.target.value;
        if (newPath === path) return;
        if (newPath === "Account Information") {
            setPath("account");
            router.push("/account");
            return;
        }
        setPath(newPath);
        router.push(`/account/${newPath.toLowerCase()}`);
    }
    return (
        <button className="bg-[#ffb100] w-60 h-10 rounded-md text-black">
            <select className="text-center" defaultValue={path} onChange={handleChange}>
                {optionLinks}
            </select>
        </button>
    )
}
