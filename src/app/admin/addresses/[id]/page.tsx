import AddressDetails from "@/app/components/admin/addresses/AddressDetails"
export default async function UserWishlistPage({ params }: { params: Promise<{ id: string }> }) {
    const id = Number((await params).id)
    return (
        <div className="w-full">
            <AddressDetails id={id} />
        </div>
    )
}
