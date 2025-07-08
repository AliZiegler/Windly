"use client"

export function WriteReviewButton({ className, searchParams }: { className?: string; searchParams: URLSearchParams }) {

    return (
        <button className={className} onClick={() => setWriteReviewShown(true)}>
            Write Review
        </button>
    );
}
