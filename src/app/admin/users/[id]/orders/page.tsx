import UserOrders from "@/app/components/admin/users/UserOrders"
export default async function UserOrdersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <div className="w-full">
            <UserOrders id={id} />
        </div>
    )
}
