import UserReviewDetails from "@/app/components/admin/users/UserReviewDetails"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
export default async function UserWishlistPage({ params }: { params: Promise<{ reviewId: string }> }) {
    const resolvedParams = await params
    const reviewId = Number(resolvedParams.reviewId)
    return (
        <div className="w-full mt-10 flex flex-col gap-5">
            <span className="ml-5">
                <Link
                    prefetch
                    title="Back To Reviews"
                    href="/admin/reviews"
                    className="flex items-center gap-2 whitespace-nowrap">
                    <ChevronLeft size={20} />
                    <span>Back To Reviews</span>
                </Link>
            </span>
            <UserReviewDetails reviewId={reviewId} id={""} name={""} />
        </div>
    )
}
