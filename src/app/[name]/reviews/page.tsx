import { reverseUrlString } from "@/app/components/global/Atoms"
import { getProductReviews, markReviewHelpful } from "@/app/actions/UserActions"
import Image from "next/image"
import Stars from "@/app/components/global/ReactStars"
import Link from "next/link"

type Params = {
    params: Promise<{ name: string }>
}

export async function handleHelpfulAction(formData: FormData) {
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

export default async function ReviewsPage({ params }: Params) {
    const { name } = await params
    const productName = reverseUrlString(name)
    const raw = await getProductReviews(productName)
    const reviews = raw.reviews

    if (!raw.success) return <h1>Failed to fetch reviews</h1>
    if (!reviews) return <h1>No reviews found</h1>

    const overallRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    const currentPath = `/${name}/reviews`

    const displayReviews = reviews.map((review) => {
        const createdAt = new Date(review.createdAt)
        return (
            <div key={review.id} className="flex flex-col gap-1">
                <span className="flex gap-3 items-center">
                    <Image
                        src={review.userImage || "/images/placeholder.png"}
                        width={50}
                        height={50}
                        alt="User Profile"
                        className="rounded-full"
                    />
                    <b>{review.userName}</b>
                </span>
                <Stars value={review.rating} edit={false} size={25} />
                <p className="text-gray-400">Reviewed on {createdAt.toLocaleString()}</p>
                <p>{review.review}</p>
                <p className="text-gray-400">{review.helpfulCount} people found this helpful</p>
                <form action={handleHelpfulAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="currentPath" value={currentPath} />
                    <button
                        type="submit"
                        className="w-32 h-9 border border-gray-300 rounded-xl mt-2 cursor-pointer hover:font-bold disabled:opacity-50"
                    >
                        Helpful
                    </button>
                </form>
            </div>
        )
    })

    return (
        <div className="flex flex-col w-full p-5 gap-8">
            <div className="flex w-full gap-8">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">Customer Reviews</h1>
                    <span className="flex gap-3 items-center">
                        <Stars value={overallRating} edit={false} size={30} />
                        <b className="text-xl">{Math.floor(overallRating)} out of 5</b>
                    </span>
                    <p className="text-gray-300">{reviews.length} reviews</p>
                </div>
                <div className="flex justify-center items-center gap-2">
                    <Link href={`/${name}`} className="cursor-pointer">
                        <Image
                            src="/images/placeholder.png"
                            width={100}
                            height={100}
                            alt="Product Image"
                        />
                    </Link>
                    <Link href={`/${name}`}>
                        <h2 className="text-2xl font-bold hover:text-[#00CAFF] text-center duration-200 cursor-pointer">
                            {productName}
                        </h2>
                    </Link>
                </div>
            </div>
            <hr />
            <div className="flex flex-col gap-5">
                {displayReviews}
            </div>
        </div>
    )
}
