"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AccontLinks() {
    const router = useRouter();
    const pathname = usePathname();
    const secondpath = pathname.split("/")[2];
    const selected = secondpath || "account";
    const [path, setPath] = useState(selected);
    const links = ["Account Information", "Wishlist", "Address", "Reviews", "Orders"];

    const optionLinks = links.map((link) => (
        <option key={link} value={link} className="bg-[#1e232b] text-white">
            {link}
        </option>
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
        <button className="w-60 h-10 rounded-md text-black">
            <select
                className="text-center bg-[#393e46] text-white border-none outline-none w-full h-full rounded-md"
                defaultValue={path}
                onChange={handleChange}
            >
                {optionLinks}
            </select>
        </button>
    )
}
