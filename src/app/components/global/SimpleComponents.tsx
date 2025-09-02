"use client";
import Link from "next/link";
import { useState } from 'react'
export function SeeAllReviews({ url }: { url: string }) {
    return (
        <Link href={url} className="text-gray-400 hover:text-gray-600 duration-100">^</Link>
    );
}
export function HoverPrefetchLink({
    href,
    children,
}: {
    href: string
    children: React.ReactNode
}) {
    const [active, setActive] = useState(false)

    return (
        <Link
            href={href}
            prefetch={active ? null : false}
            onMouseEnter={() => setActive(true)}
            className="link-hover"
        >
            {children}
        </Link>
    )
}
