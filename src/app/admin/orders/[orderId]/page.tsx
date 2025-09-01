import UserOrderInformation from "@/app/components/admin/users/UserOrderInformation"
export default async function UserWishlistPage({ params }: { params: Promise<{ orderId: number }> }) {
    const { orderId } = await params
    return (
        <div className="w-full p-5">
            <UserOrderInformation orderId={orderId} previousPage="/admin/orders" />
        </div>
    )
}
