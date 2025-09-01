import UserOrderInformation from "@/app/components/admin/users/UserOrderInformation"
export default async function UserWishlistPage({ params }: { params: Promise<{ id: string, orderId: number }> }) {
    const { orderId } = await params
    return (
        <div className="w-full">
            <UserOrderInformation orderId={orderId} />
        </div>
    )
}
