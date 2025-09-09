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
                title="Delete Address"
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

type RatingSliderProps = {
    defaultValue?: number;
    label: string;
    inputName: string;
    min?: number;
    max?: number;
    step?: number;
};

export function RatingSlider({
    defaultValue = 0,
    label,
    inputName,
    min = 0,
    max = 5,
    step = 0.5,
}: RatingSliderProps) {
    const [value, setValue] = useState<number>(defaultValue);

    return (
        <div className="space-y-3 group">
            <div className="flex items-center justify-between">
                <label
                    htmlFor={inputName}
                    className="text-sm font-medium text-gray-300 group-focus-within:text-[#00CAFF] transition-colors"
                >
                    {label}
                </label>
                <span className="text-gray-300 text-sm font-semibold">
                    {value}
                </span>
            </div>

            <input
                id={inputName}
                type="range"
                name={inputName}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full accent-[#00CAFF] cursor-pointer"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
            />

            {/* hidden input ensures the current value is included when submitting the form */}
            <input type="hidden" name={inputName} value={value} />
        </div>
    );
}
