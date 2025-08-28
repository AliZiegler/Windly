import UserReviewDetails from "@/app/components/admin/users/UserReviewDetails"
export default async function UserWishlistPage({ params }: { params: Promise<{ id: string, name: string }> }) {
    const { id, name } = await params
    return (
        <div className="w-full">
            <UserReviewDetails id={id} name={name} />
        </div>
    )
}
