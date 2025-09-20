"use client";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
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
    defaultValue?: [number, number];
    label: string;
    inputName: string;
    min?: number;
    max?: number;
    step?: number;
    onChange?: (values: [number, number]) => void; // Add this
};

export function RatingSlider({
    defaultValue = [0, 5],
    label,
    inputName,
    min = 0,
    max = 5,
    step = 0.5,
    onChange, // Add this
}: RatingSliderProps) {
    const [value, setValue] = useState<[number, number]>(defaultValue);

    const handleChange = (newValue: number[]) => {
        const newValues = [newValue[0], newValue[1]] as [number, number];
        setValue(newValues);
        if (onChange) {
            onChange(newValues); // Call the passed onChange function
        }
    };

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
                    {value[0]} - {value[1]}
                </span>
            </div>
            <RangeSlider
                id={inputName}
                min={min}
                max={max}
                step={step}
                value={value}
                onInput={handleChange}
                className="w-full cursor-pointer"
            />
            {/* hidden inputs ensure the current values are included when submitting the form */}
            <input type="hidden" name={`${inputName}_min`} value={value[0]} />
            <input type="hidden" name={`${inputName}_max`} value={value[1]} />
        </div>
    );
}
