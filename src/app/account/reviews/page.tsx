import { auth } from '@/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { reviewTable, productTable } from '@/db/schema';
import Link from 'next/link';
import { urlString } from '@/app/components/global/Atoms';
import Stars from '@/app/components/global/ReactStars';

export default async function Reviews() {
    const session = await auth();
    if (!session?.user?.id) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-gray-400 text-lg">Not logged in</div>
            </div>
        );
    }

    const reviews = await db
        .select({
            id: reviewTable.id,
            productId: reviewTable.productId,
            rating: reviewTable.rating,
            reviewText: reviewTable.review,
            createdAt: reviewTable.createdAt,
            productName: productTable.name,
        })
        .from(reviewTable)
        .innerJoin(productTable, eq(reviewTable.productId, productTable.id))
        .where(eq(reviewTable.userId, session.user.id));

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="text-4xl mb-4 opacity-50">⭐</div>
                <h1 className="font-bold text-2xl mb-2">My Reviews</h1>
                <p className="text-gray-400">You haven&apos;t written any reviews yet.</p>
            </div>
        );
    }

    const displayReviews = reviews.map(({ id, createdAt, productName, rating, reviewText }) => {
        const date = (new Date(createdAt))
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const formattedDate = `${day}/${month}/${year}`;
        const trimmedReview =
            reviewText.length > 40 ? reviewText.slice(0, 37) + '...' : reviewText;

        return (
            <tr key={id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                    {formattedDate}
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm">
                    <Link
                        href={`/${urlString(productName)}`}
                        className="hover:text-[#00CAFF] duration-200 line-clamp-2 block"
                        title={productName}
                    >
                        {productName}
                    </Link>
                </td>
                <td className="p-2 sm:p-3">
                    <div className="flex justify-center">
                        <Stars value={rating} edit={false} count={5} size={18} />
                    </div>
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-300">
                    <span title={reviewText}>{trimmedReview}</span>
                </td>
                <td className="p-2 sm:p-3 text-center">
                    <Link
                        href={`/account/reviews/${urlString(productName)}`}
                        className="hover:text-[#00CAFF] duration-200 underline text-xs sm:text-sm whitespace-nowrap"
                    >
                        View
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div className="flex flex-col w-full gap-4 overflow-hidden">
            <h1 className="font-bold text-xl sm:text-2xl">My Reviews</h1>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                    <thead className="bg-[#1e232b] border-y-2 border-[#1c2129]">
                        <tr>
                            <th className="w-[15%] p-3 text-sm font-semibold">Date</th>
                            <th className="w-[35%] p-3 text-sm font-semibold">Product Name</th>
                            <th className="w-[15%] p-3 text-sm font-semibold text-center">Rating</th>
                            <th className="w-[25%] p-3 text-sm font-semibold">Review</th>
                            <th className="w-[10%] p-3 text-sm font-semibold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="border-b-2 border-[#1c2129]">
                        {displayReviews}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {reviews.map(({ id, createdAt, productName, rating, reviewText }) => {
                    const date = (new Date(createdAt))
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();
                    const formattedDate = `${day}/${month}/${year}`;
                    const trimmedReview = reviewText.length > 100 ? reviewText.slice(0, 97) + '...' : reviewText;

                    return (
                        <div key={id} className="bg-[#1e232b] rounded-lg p-4 border border-[#2a3038]">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/${urlString(productName)}`}
                                        className="font-medium hover:text-[#00CAFF] duration-200 line-clamp-2 block text-sm"
                                        title={productName}
                                    >
                                        {productName}
                                    </Link>
                                    <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
                                </div>
                                <div className="ml-3 flex-shrink-0">
                                    <Stars value={rating} edit={false} count={5} size={16} />
                                </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-3 leading-relaxed" title={reviewText}>
                                {trimmedReview}
                            </p>

                            <div className="flex justify-end">
                                <Link
                                    href={`/account/reviews/${urlString(productName)}`}
                                    className="text-[#00CAFF] hover:text-[#00a8d9] duration-200 underline text-sm font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
