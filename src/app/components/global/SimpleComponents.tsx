"use client";
import { XCircle } from "lucide-react";
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
export function ReviewDeleteButton({
    reviewId,
    handleDeleteReviewAction
}: {
    reviewId: number;
    handleDeleteReviewAction: (formData: FormData) => Promise<void>;
}) {
    return (
        <form action={handleDeleteReviewAction}>
            <input type="hidden" name="reviewId" value={reviewId} />
            <button
                type="submit"
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group cursor-pointer"
                title="Delete Review"
                onClick={(e) => {
                    if (!confirm('Delete this review? This action cannot be undone.')) {
                        e.preventDefault();
                    }
                }}
            >
                <XCircle className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
            </button>
        </form>
    );
}

export function AddressDeleteButton({
    addressId,
    handleDeleteAddressAction
}: {
    addressId: number;
    handleDeleteAddressAction: (formData: FormData) => Promise<void>;
}) {
    return (
        <form action={handleDeleteAddressAction}>
            <input type="hidden" name="addressId" value={addressId} />
            <button
                type="submit"
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors duration-200 group cursor-pointer"
                title="Delete Review"
                onClick={(e) => {
                    if (!confirm('Delete this addreess? This action cannot be undone.')) {
                        e.preventDefault();
                    }
                }}
            >
                <XCircle className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
            </button>
        </form>
    );
}
