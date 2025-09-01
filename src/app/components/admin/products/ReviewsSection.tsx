import { urlString } from "@/app/components/global/Atoms"
import { getProductReviews, getUserHelpfulReviewsIds, markReviewHelpful } from "@/app/actions/ReviewActions"
import { auth } from "@/auth"
import Image from "next/image"
import Stars from "@/app/components/global/ReactStars"
import Link from "next/link"
import ReviewsFilters from "@/app/components/productDetails/ReviewsFilters"
import { CircleAlert, MessageSquareMore, Search, SquarePen, Star, ThumbsUp } from "lucide-react"
import { ResolvedSearchParamsType } from "@/app/components/global/Types"

type Params = {
    productName: string
    searchParams: ResolvedSearchParamsType
}

async function handleHelpfulAction(formData: FormData) {
    "use server";

    const reviewId = formData.get("reviewId");
    if (!reviewId || typeof reviewId !== "string") {
        throw new Error("Invalid reviewId");
    }

    const id = Number(reviewId);
    if (Number.isNaN(id)) {
        throw new Error("Invalid reviewId format");
    }

    const result = await markReviewHelpful(id);

    if (!result.success) {
        console.log("Vote failed:", result.error);
    }
}

export default async function ReviewsPage({ productName, searchParams }: Params) {
    const urlName = urlString(productName)

    // Debug logging
    console.log("Search params received:", searchParams);

    // Better parameter extraction
    const rawSort = searchParams?.sort
    const rawRating = searchParams?.rating
    const rawSearch = searchParams?.search

    // Handle both array and string formats more robustly
    const sort = Array.isArray(rawSort) ? rawSort[0] : (rawSort || "newest")
    const rating = Array.isArray(rawRating) ? rawRating[0] : (rawRating || "all")
    const search = Array.isArray(rawSearch) ? rawSearch[0] : (rawSearch || "")

    // Debug logging
    console.log("Processed search parameter:", search);
    console.log("Search parameter type:", typeof search);
    console.log("Search parameter length:", search?.length || 0);

    const session = await auth()
    const userId = session?.user?.id
    let userHelpfulReviewsIds = null
    let helpfulIds = null
    if (userId) {
        userHelpfulReviewsIds = await getUserHelpfulReviewsIds(userId)
        helpfulIds = userHelpfulReviewsIds.reviews?.map(review => review.reviewId)
    }
    const raw = await getProductReviews(productName)
    const { reviews } = raw

    if (!raw.success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#222831" }}>
                <div className="text-center p-8 bg-red-500/10 border border-red-400/30 rounded-2xl max-w-md">
                    <CircleAlert size={60} color="#ff6467" className="mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-red-300 mb-2">Failed to Load Reviews</h1>
                    <p className="text-gray-400">Please try again later</p>
                </div>
            </div>
        )
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4">
                        <Link href={`/${urlName}`} className="flex items-center gap-4 group">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-800">
                                <Image
                                    src="/images/placeholder.png"
                                    fill
                                    alt="Product"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-100 group-hover:text-[#00CAFF] transition-colors duration-200">
                                    {productName}
                                </h1>
                                <p className="text-gray-400">Customer Reviews</p>
                            </div>
                        </Link>
                    </div>

                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                            <MessageSquareMore size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-200 mb-2">No Reviews Yet</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Be the first to share your experience with this product
                        </p>
                        <Link
                            href={`/${urlName}?review=shown`}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <SquarePen className="w-5 h-5 mr-2" />
                            Write First Review
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Start with a copy of all reviews
    let filteredReviews = [...reviews];

    // Apply search filter first - with more robust search logic
    if (search && search.trim() !== "") {
        const searchTerm = search.trim().toLowerCase();
        console.log("Applying search filter for term:", searchTerm);

        filteredReviews = filteredReviews.filter(review => {
            const reviewText = review.review?.toLowerCase() || "";
            const userName = review.userName?.toLowerCase() || "";

            const matchesReview = reviewText.includes(searchTerm);
            const matchesUser = userName.includes(searchTerm);

            console.log(`Review ID ${review.id}: reviewText includes "${searchTerm}": ${matchesReview}, userName includes "${searchTerm}": ${matchesUser}`);

            return matchesReview || matchesUser;
        });

        console.log(`Search filtered ${reviews.length} reviews down to ${filteredReviews.length}`);
    }

    // Apply rating filter
    if (rating && rating !== 'all') {
        const ratingNum = parseInt(rating);
        if (!isNaN(ratingNum)) {
            filteredReviews = filteredReviews.filter(review => Math.floor(review.rating) === ratingNum);
            console.log(`Rating filter applied: ${filteredReviews.length} reviews match rating ${ratingNum}`);
        }
    }

    // Sort reviews
    switch (sort) {
        case 'newest':
            filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        case 'oldest':
            filteredReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            break;
        case 'highest':
            filteredReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            filteredReviews.sort((a, b) => a.rating - b.rating);
            break;
        case 'helpful':
            filteredReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
            break;
        default:
            // Default to newest
            filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const overallRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    const currentPath = `/${urlName}/reviews`
    const writeReviewPath = `/${urlName}?review=shown`

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(review => Math.floor(review.rating) === star).length,
        percentage: (reviews.filter(review => Math.floor(review.rating) === star).length / reviews.length) * 100
    }))

    const displayReviews = filteredReviews.map((review) => {
        const createdAt = new Date(review.createdAt)
        const isHelpful = helpfulIds?.includes(review.id)
        const timeAgo = getTimeAgo(createdAt)

        return (
            <div key={review.id} className="border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300" style={{ backgroundColor: "#2a313c" }}>
                <div className="flex items-start gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                        <Image
                            src={review.userImage || "/images/placeholder.png"}
                            fill
                            alt={`${review.userName}'s profile`}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="font-semibold text-gray-200 truncate">{review.userName}</h3>
                            <time className="text-sm text-gray-400">{timeAgo}</time>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <Stars value={review.rating} edit={false} size={20} />
                            <span className="text-sm font-medium text-gray-300">{review.rating}/5</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{review.review}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.helpfulCount} people found this helpful</span>
                    </div>

                    {userId && (
                        <form action={handleHelpfulAction}>
                            <input type="hidden" name="reviewId" value={review.id} />
                            <input type="hidden" name="currentPath" value={currentPath} />
                            <button
                                type="submit"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${isHelpful
                                    ? 'border-blue-400 bg-blue-500/10 text-blue-300'
                                    : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white hover:bg-gray-700/30'
                                    }`}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                <span className="font-medium">
                                    {isHelpful ? 'Helpful ✓' : 'Helpful'}
                                </span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )
    })

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#222831" }}>
            <div className="mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
                    <Link href={`/${urlName}`} className="flex items-center gap-4 group">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-800 shadow-lg">
                            <Image
                                src="/images/placeholder.png"
                                fill
                                alt="Product"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 group-hover:text-[#00CAFF] transition-colors duration-200">
                                {productName}
                            </h1>
                            <p className="text-gray-400 text-lg">Customer Reviews</p>
                        </div>
                    </Link>
                    <Link
                        href={writeReviewPath}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg"
                    >
                        <SquarePen className="w-5 h-5" />
                        Write Your Review
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 ">
                    <div className="lg:col-span-1">
                        <div className="border flex flex-col items-center justify-center lg:min-h-[242px] border-gray-700/50 rounded-2xl p-6 text-center" style={{ backgroundColor: "#2a313c" }}>
                            <div className="text-5xl font-bold text-gray-100 mb-2">
                                {overallRating.toFixed(1)}
                            </div>
                            <Stars value={overallRating} edit={false} size={32} />
                            <p className="text-gray-400 mt-2">
                                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="border border-gray-700/50 rounded-2xl p-6" style={{ backgroundColor: "#2a313c" }}>
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Rating Breakdown</h3>
                            <div className="space-y-3">
                                {ratingCounts.map(({ star, count, percentage }) => (
                                    <div key={star} className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 w-12">
                                            <span className="text-sm text-gray-300">{star}</span>
                                            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" strokeWidth={0.5} />
                                        </div>
                                        <div className="flex-1 rounded-full h-2" style={{ backgroundColor: "#1a1f26" }}>
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-400 w-12">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <ReviewsFilters
                    totalReviews={reviews.length}
                    filteredCount={filteredReviews.length}
                    currentSort={sort}
                    currentRating={rating}
                    currentSearch={search}
                />

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-100">
                            {filteredReviews.length === reviews.length
                                ? `All Reviews (${reviews.length})`
                                : `Showing ${filteredReviews.length} of ${reviews.length} reviews`
                            }
                        </h2>
                    </div>

                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-200 mb-2">No reviews match your filters</h3>
                            <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                            <Link
                                href={`/${urlName}/reviews`}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-medium rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                            >
                                Clear Filters
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {displayReviews}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
}
