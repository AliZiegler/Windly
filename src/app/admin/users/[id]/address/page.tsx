import UserAddressBook from "@/app/components/admin/users/UserAddressBook"
export default async function UserAddressBookPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <div className="w-full">
            <UserAddressBook id={id} />
        </div>
    )
}
