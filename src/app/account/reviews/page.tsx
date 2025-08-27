import { auth } from '@/auth';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { reviewTable, productTable } from '@/db/schema';
import Link from 'next/link';
import { urlString } from '@/app/components/global/Atoms';
import Stars from '@/app/components/global/ReactStars';
import { Star, MessageSquare, Calendar, Package } from 'lucide-react';

export default async function Reviews() {
    const session = await auth();
    if (!session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038] p-6">
                <div className="text-4xl mb-4 opacity-50">🔒</div>
                <h1 className="font-bold text-xl mb-2 text-white">Access Restricted</h1>
                <p className="text-gray-400">Please log in to view your reviews.</p>
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
        .where(eq(reviewTable.userId, session.user.id))
        .orderBy(reviewTable.createdAt);

    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;
    const recentReviews = reviews.filter(review => {
        const reviewDate = new Date(review.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return reviewDate >= thirtyDaysAgo;
    }).length;

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">My Reviews</h1>
                        <p className="text-gray-400">
                            Manage and view all your product reviews
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038] p-6">
                    <div className="text-4xl mb-4 opacity-50">⭐</div>
                    <h2 className="font-bold text-xl mb-2 text-white">No Reviews Yet</h2>
                    <p className="text-gray-400 mb-4">
                        You haven&apos;t written any reviews yet. Start sharing your thoughts on products you&apos;ve purchased!
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                    >
                        <Package className="w-5 h-5 mr-2" />
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    const displayReviews = reviews.map(({ id, createdAt, productName, rating, reviewText }) => {
        const date = new Date(createdAt);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        const trimmedReview = reviewText.length > 40 ? reviewText.slice(0, 37) + '...' : reviewText;

        return (
            <tr key={id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3">
                    <div className="flex items-center gap-1 text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formattedDate}</span>
                    </div>
                </td>
                <td className="p-3">
                    <Link
                        href={`/${urlString(productName)}`}
                        className="font-medium text-gray-200 hover:text-[#00CAFF] duration-200 line-clamp-2 block"
                        title={productName}
                    >
                        {productName}
                    </Link>
                </td>
                <td className="p-2 min-w-[89.0167px]">
                    <div className="flex justify-center">
                        <Stars value={rating} edit={false} count={5} size={18} />
                    </div>
                </td>
                <td className="p-3">
                    <span
                        className="text-sm text-gray-300 cursor-help"
                        title={reviewText}
                    >
                        {trimmedReview}
                    </span>
                </td>
                <td className="p-3 text-center">
                    <Link
                        href={`/account/reviews/${urlString(productName)}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 
                                 hover:bg-blue-500/30 hover:text-blue-300 rounded-lg transition-all duration-200 text-sm"
                    >
                        View Details
                    </Link>
                </td>
            </tr>
        );
    });

    const theadElements = ['Date', 'Product', 'Rating', 'Review', 'Action'];
    const displayTHeadElements = theadElements.map((element) => {
        const isCenter = ['Rating', 'Action'].includes(element);
        return (
            <th key={element} className={`p-3 text-sm font-semibold text-gray-300 ${isCenter ? 'text-center' : 'text-left'}`}>
                {element}
            </th>
        )
    });

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">My Reviews</h1>
                    <p className="text-gray-400">
                        Manage and view all your product reviews
                        {totalReviews > 0 && (
                            <span className="ml-2">• {totalReviews} review{totalReviews !== 1 ? 's' : ''} total</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Reviews</p>
                            <p className="text-2xl font-bold text-white">{totalReviews}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Average Rating</p>
                            <p className="text-2xl font-bold text-yellow-400">{averageRating}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Star fill="currentColor" className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Recent (30d)</p>
                            <p className="text-2xl font-bold text-green-400">{recentReviews}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">All Reviews</h2>
                        <span className="text-sm text-gray-400">
                            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2129]">
                            <tr>
                                {displayTHeadElements}
                            </tr>
                        </thead>
                        <tbody>
                            {displayReviews}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    {reviews.map(({ id, createdAt, productName, rating, reviewText }) => {
                        const date = new Date(createdAt);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const year = date.getFullYear();
                        const formattedDate = `${day}/${month}/${year}`;
                        const trimmedReview = reviewText.length > 100 ? reviewText.slice(0, 97) + '...' : reviewText;

                        return (
                            <div key={id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/${urlString(productName)}`}
                                            className="font-medium text-gray-200 hover:text-[#00CAFF] duration-200 line-clamp-2 block text-sm"
                                            title={productName}
                                        >
                                            {productName}
                                        </Link>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <Calendar className="w-3 h-3" />
                                            {formattedDate}
                                        </div>
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
                                        className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 
                                                 hover:bg-blue-500/30 hover:text-blue-300 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Results Summary */}
            <div className="text-center text-sm text-gray-400 pb-4">
                Showing all {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
