import Link from "next/link";
export function SeeAllReviews({ url }: { url: string }) {
    return (
        <Link href={url} className="text-gray-400 hover:text-gray-600 duration-100">^</Link>
    );
}
