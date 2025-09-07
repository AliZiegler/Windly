import { db } from "@/lib/db";
import ReviewFilterForm from "@/app/components/admin/reviews/ReviewsFilterForm";
import { eq, sql, like, and, or, asc, desc, gte, lte } from "drizzle-orm";
import {
    userTable,
    reviewTable,
    productTable,
} from "@/db/schema";
import Link from "next/link";
import {
    Eye, MessageSquare, Star, ThumbsUp,
    User, Package, Calendar,
    AlertCircle, CheckCircle2, XCircle
} from "lucide-react";
import Image from "next/image";
import { ResolvedSearchParamsType, SearchParamsType } from "@/app/components/global/Types";
import SummaryFilter from "@/app/components/global/SummaryFilter";
import { deleteReview } from "@/app/actions/ReviewActions";
import { ReviewDeleteButton } from "@/app/components/global/SimpleComponents";

async function handleDeleteReview(formData: FormData) {
    "use server";
    const reviewId = Number(formData.get("reviewId"));
    await deleteReview(reviewId);
}

function normalizeParams(sp: ResolvedSearchParamsType) {
    const toStr = (val: string | string[] | undefined): string | undefined =>
        Array.isArray(val) ? val[0] : val;

    return {
        search: toStr(sp.search),
        rating: toStr(sp.rating),
        minRating: toStr(sp.minRating),
        maxRating: toStr(sp.maxRating),
        userId: toStr(sp.userId),
        productId: toStr(sp.productId),
        hasHelpful: toStr(sp.hasHelpful),
        minHelpful: toStr(sp.minHelpful),
        maxHelpful: toStr(sp.maxHelpful),
        createdAfter: toStr(sp.createdAfter),
        createdBefore: toStr(sp.createdBefore),
        sortBy: toStr(sp.sortBy),
        sortOrder: toStr(sp.sortOrder),
    };
}

export default async function AdminReviews({
    searchParams
}: {
    searchParams: SearchParamsType
}) {
    const sp = await searchParams;
    const {
        search,
        rating,
        minRating,
        maxRating,
        userId,
        productId,
        hasHelpful,
        minHelpful,
        maxHelpful,
        createdAfter,
        createdBefore,
        sortBy,
        sortOrder
    } = normalizeParams(sp);

    const buildWhereClause = () => {
        const conditions = [];

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(reviewTable.review, searchTerm),
                    like(userTable.name, searchTerm),
                    like(userTable.email, searchTerm),
                    like(productTable.name, searchTerm)
                )
            );
        }

        if (rating) {
            conditions.push(eq(reviewTable.rating, parseFloat(rating)));
        }

        if (minRating) {
            conditions.push(gte(reviewTable.rating, parseFloat(minRating)));
        }

        if (maxRating) {
            conditions.push(lte(reviewTable.rating, parseFloat(maxRating)));
        }

        if (userId) {
            conditions.push(eq(reviewTable.userId, userId));
        }

        if (productId) {
            conditions.push(eq(reviewTable.productId, parseInt(productId)));
        }

        if (hasHelpful === '1') {
            conditions.push(sql`${reviewTable.helpfulCount} > 0`);
        } else if (hasHelpful === '0') {
            conditions.push(eq(reviewTable.helpfulCount, 0));
        }

        if (minHelpful) {
            conditions.push(gte(reviewTable.helpfulCount, parseInt(minHelpful)));
        }

        if (maxHelpful) {
            conditions.push(lte(reviewTable.helpfulCount, parseInt(maxHelpful)));
        }

        if (createdAfter) {
            conditions.push(sql`${reviewTable.createdAt} >= ${createdAfter}`);
        }

        if (createdBefore) {
            conditions.push(sql`${reviewTable.createdAt} <= ${createdBefore}`);
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
    };

    const buildOrderClause = () => {
        const orderBy = sortBy || 'createdAt';
        const order = sortOrder || 'desc';

        let column;
        switch (orderBy) {
            case 'rating':
                column = reviewTable.rating;
                break;
            case 'helpfulCount':
                column = reviewTable.helpfulCount;
                break;
            case 'userName':
                column = userTable.name;
                break;
            case 'productName':
                column = productTable.name;
                break;
            case 'updatedAt':
                column = reviewTable.updatedAt;
                break;
            default:
                column = reviewTable.createdAt;
        }

        return order === 'asc' ? asc(column) : desc(column);
    };

    const reviewsWithDetails = await db
        .select({
            id: reviewTable.id,
            productId: reviewTable.productId,
            userId: reviewTable.userId,
            rating: reviewTable.rating,
            review: reviewTable.review,
            createdAt: reviewTable.createdAt,
            updatedAt: reviewTable.updatedAt,
            helpfulCount: reviewTable.helpfulCount,
            userName: userTable.name,
            userEmail: userTable.email,
            userImage: userTable.image,
            productName: productTable.name,
            productImage: productTable.img,
            productPrice: productTable.price,
        })
        .from(reviewTable)
        .leftJoin(userTable, eq(reviewTable.userId, userTable.id))
        .leftJoin(productTable, eq(reviewTable.productId, productTable.id))
        .where(buildWhereClause())
        .orderBy(buildOrderClause());

    // Calculate statistics
    const totalReviews = reviewsWithDetails.length;
    const averageRating = totalReviews > 0
        ? reviewsWithDetails.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;
    const totalHelpfulVotes = reviewsWithDetails.reduce((sum, review) => sum + review.helpfulCount, 0);
    const ratingDistribution = {
        5: reviewsWithDetails.filter(r => r.rating >= 4.5).length,
        4: reviewsWithDetails.filter(r => r.rating >= 3.5 && r.rating < 4.5).length,
        3: reviewsWithDetails.filter(r => r.rating >= 2.5 && r.rating < 3.5).length,
        2: reviewsWithDetails.filter(r => r.rating >= 1.5 && r.rating < 2.5).length,
        1: reviewsWithDetails.filter(r => r.rating < 1.5).length,
    };

    const getRatingBadge = (rating: number) => {
        if (rating >= 4.5) {
            return { text: 'Excellent', color: 'text-green-400 bg-green-500/20 border-green-500/30', icon: CheckCircle2 };
        } else if (rating >= 3.5) {
            return { text: 'Good', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', icon: Star };
        } else if (rating >= 2.5) {
            return { text: 'Average', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30', icon: AlertCircle };
        } else if (rating >= 1) {
            return { text: 'Poor', color: 'text-red-400 bg-red-500/20 border-red-500/30', icon: XCircle };
        } else {
            return { text: 'Terrible', color: 'text-red-600 bg-red-600/20 border-red-600/30', icon: XCircle };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            if (rating >= starValue) {
                // Full star
                return (
                    <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                    />
                );
            } else if (rating >= starValue - 0.5) {
                // Half star
                return (
                    <div key={i} className="relative w-4 h-4">
                        <Star className="w-4 h-4 text-gray-500 absolute" />
                        <div className="overflow-hidden w-1/2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                    </div>
                );
            } else {
                // Empty star
                return (
                    <Star
                        key={i}
                        className="w-4 h-4 text-gray-500"
                    />
                );
            }
        });
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const displayReviews = reviewsWithDetails.map((review) => {
        const createdDate = formatDate(review.createdAt);
        const updatedDate = formatDate(review.updatedAt);
        const ratingBadge = getRatingBadge(review.rating);
        const RatingBadgeIcon = ratingBadge.icon;

        return (
            <tr key={review.id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2a3038] flex-shrink-0">
                            {review.userImage ? (
                                <Image
                                    src={review.userImage}
                                    alt={review.userName || 'User'}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/admin/users/${review.userId}`}
                                className="font-medium hover:text-[#00CAFF] duration-200 text-gray-200 truncate block text-sm">
                                {review.userName}
                            </Link>
                            <div className="text-xs text-gray-400 truncate">
                                {review.userEmail}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-xs text-gray-400 ml-1">
                                    ({review.rating})
                                </span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-3">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#2a3038] flex-shrink-0">
                            {review.productImage ? (
                                <Image
                                    src={review.productImage}
                                    alt={review.productName || 'Product'}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/admin/products/${review.productId}`}
                                className="font-medium hover:text-[#00CAFF] duration-200 text-gray-200 truncate block text-sm">
                                {truncateText(review.productName || 'Unknown Product', 30)}
                            </Link>
                            <div className="text-xs text-green-400 font-medium">
                                {review.productPrice ? formatPrice(review.productPrice) : "N/A"}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-3">
                    <div className="max-w-xs">
                        <p className="text-sm text-gray-200 mb-2 line-clamp-3">
                            {truncateText(review.review, 120)}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${ratingBadge.color}`}>
                            <RatingBadgeIcon className="w-3 h-3" />
                            {ratingBadge.text}
                        </span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-gray-200">
                                {review.helpfulCount}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">helpful</span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1 justify-center">
                            <Calendar className="w-3 h-3" />
                            <span>Created</span>
                        </div>
                        <span className="text-gray-200">{createdDate}</span>
                        {review.createdAt !== review.updatedAt && (
                            <>
                                <span className="text-gray-500">Updated</span>
                                <span className="text-gray-300">{updatedDate}</span>
                            </>
                        )}
                    </div>
                </td>
                <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            href={`/admin/reviews/${review.id}`}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200 group"
                            title="View Review Details"
                        >
                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                        </Link>
                        <ReviewDeleteButton
                            reviewId={review.id}
                            handleDeleteReviewAction={handleDeleteReview}
                        />
                    </div>
                </td>
            </tr>
        );
    });

    const theadElements = ['Reviewer', 'Product', 'Review', 'Helpful', 'Dates', 'Actions'];
    const leftAlignedHeaders = ['Reviewer', 'Product', 'Review'];
    const displayTHeadElements = theadElements.map((element) => {
        const isTextLeft = leftAlignedHeaders.includes(element);
        return (
            <th key={element} className={`p-3 text-sm font-semibold text-gray-300 ${isTextLeft ? 'text-left' : 'text-center'}`}>
                {element}
            </th>
        )
    });

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">Review Management</h1>
                    <p className="text-gray-400">
                        Manage product reviews and monitor review quality
                        {totalReviews > 0 && (
                            <span className="ml-2">• {totalReviews} review{totalReviews !== 1 ? 's' : ''} found</span>
                        )}
                    </p>
                </div>
            </div>
            <SummaryFilter>
                <ReviewFilterForm searchParams={sp} />
            </SummaryFilter>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-yellow-400">
                                    {averageRating.toFixed(1)}
                                </p>
                                <div className="flex items-center">
                                    {renderStars(averageRating).slice(0, 1)}
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">5-Star Reviews</p>
                            <p className="text-2xl font-bold text-green-400">{ratingDistribution[5]}</p>
                            <p className="text-xs text-gray-400">
                                {totalReviews > 0 ? ((ratingDistribution[5] / totalReviews) * 100).toFixed(1) : 0}% of total
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Helpful Votes</p>
                            <p className="text-2xl font-bold text-purple-400">{totalHelpfulVotes}</p>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <ThumbsUp className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                <h3 className="font-semibold text-lg text-white mb-4">Rating Distribution</h3>
                <div className="grid grid-cols-5 gap-4">
                    {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-2">
                                <span className="text-sm font-medium text-gray-300">{rating}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            </div>
                            <div className="bg-[#2a3038] rounded-full h-2 mb-2">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: totalReviews > 0 ? `${(ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100}%` : '0%'
                                    }}
                                />
                            </div>
                            <div className="text-sm font-bold text-white">
                                {ratingDistribution[rating as keyof typeof ratingDistribution]}
                            </div>
                            <div className="text-xs text-gray-400">
                                {totalReviews > 0 ? ((ratingDistribution[rating as keyof typeof ratingDistribution] / totalReviews) * 100).toFixed(1) : 0}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews Table */}
            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                            {Object.keys(sp).length > 0 ? 'Filtered Reviews' : 'All Reviews'}
                        </h2>
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
                    {reviewsWithDetails.map((review) => {
                        const createdDate = formatDate(review.createdAt);
                        const ratingBadge = getRatingBadge(review.rating);
                        const RatingBadgeIcon = ratingBadge.icon;

                        return (
                            <div key={review.id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#2a3038] flex-shrink-0">
                                        {review.userImage ? (
                                            <Image
                                                src={review.userImage}
                                                alt={review.userName || 'User'}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/admin/users/${review.userId}`}
                                            className="font-medium text-gray-200 hover:text-[#00CAFF] duration-200 block">
                                            {review.userName}
                                        </Link>
                                        <div className="text-xs text-gray-400">{review.userEmail}</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-gray-400 ml-1">
                                                ({review.rating})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <Link
                                        href={`/admin/products/${review.productId}`}
                                        className="text-sm font-medium text-blue-400 hover:text-blue-300 duration-200">
                                        {review.productName}
                                    </Link>
                                    <div className="text-xs text-green-400 font-medium">
                                        {review.productPrice ? formatPrice(review.productPrice) : 'N/A'}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-200 mb-2">
                                        {truncateText(review.review, 150)}
                                    </p>
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${ratingBadge.color}`}>
                                        <RatingBadgeIcon className="w-3 h-3" />
                                        {ratingBadge.text}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3 text-blue-400" />
                                            <span>{review.helpfulCount} helpful</span>
                                        </div>
                                        <span>Created: {createdDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/reviews/${review.id}`}
                                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors duration-200"
                                        >
                                            <Eye className="w-5 h-5 text-blue-400" />
                                        </Link>
                                        <ReviewDeleteButton
                                            reviewId={review.id}
                                            handleDeleteReviewAction={handleDeleteReview}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* No Reviews Found */}
            {reviewsWithDetails.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038]">
                    <div className="text-4xl mb-4 opacity-50">💬</div>
                    <h2 className="font-bold text-xl mb-2 text-white">
                        {Object.keys(sp).length > 0 ? 'No Reviews Match Your Filters' : 'No Reviews Found'}
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {Object.keys(sp).length > 0
                            ? 'Try adjusting your search criteria or clear the filters to see all reviews.'
                            : 'No reviews have been submitted yet.'
                        }
                    </p>
                </div>
            )}

            {/* Results Summary */}
            {totalReviews > 0 && (
                <div className="text-center text-sm text-gray-400 pb-4">
                    Showing {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    {Object.keys(sp).length > 0 && ' matching your filters'}
                    {totalReviews > 0 && (
                        <span className="ml-2">
                            • Average rating: {averageRating.toFixed(1)}/5.0
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
