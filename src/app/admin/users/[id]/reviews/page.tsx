import UserReviews from "@/app/components/admin/users/UserReviews"
export default async function UserReviewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <div className="w-full">
            <UserReviews userId={id} />
        </div>
    )
}
