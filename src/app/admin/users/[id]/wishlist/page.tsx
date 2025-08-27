import UserWishlist from "@/app/components/admin/users/UserWishlist"
export default async function UserWishlistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <div className="w-full">
            <UserWishlist id={id} />
        </div>
    )
}
