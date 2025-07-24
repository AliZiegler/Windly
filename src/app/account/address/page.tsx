import { db } from "@/lib/db"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { addressTable, userTable } from "@/db/schema"
import Link from "next/link"
import { deleteAddress, setUserAddress } from "@/app/actions/UserActions"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Not authenticated")
    }
    const userId = session.user.id

    const userAddresses = await db.select().from(addressTable).where(eq(addressTable.userId, session.user.id))
    const defaultAddressId = await db.select({ addressId: userTable.addressId }).from(userTable).where(eq(userTable.id, session.user.id))
    const defaultAddress = userAddresses.find((address) => address.id === defaultAddressId[0].addressId)
    if (!defaultAddress) {
        redirect("/account/address/new")
    }

    async function handleDeleteAddress(formData: FormData) {
        'use server'
        const stringAddressId = formData.get('addressId')
        const addressId = Number(stringAddressId)
        await deleteAddress(addressId, userId)
    }
    async function handleSetDefaultAddress(formData: FormData) {
        'use server'
        const stringAddressId = formData.get('addressId')
        const addressId = Number(stringAddressId)
        await setUserAddress(addressId, userId)
    }
    const displayAddreeses = userAddresses.map((address) => {
        return (
            <div key={address.id} className="flex flex-col bg-[#393e46] p-4 rounded-xs mb-3">
                {address.id === defaultAddressId[0].addressId &&
                    <span className="bg-[#007bff] mb-2 font-extrabold text-sm text-center text-white px-2 py-0.5 rounded-lg w-20">Default</span>
                }
                <b className="font-bold text-lg">{address.addressType === "home" ? "Home" : "Office"}</b>
                <p className="my-2">{address.name}</p>
                <span className="flex justify-between">
                    <span className="flex flex-col">
                        <div>
                            {address.street} {address.buildingNumber}
                        </div>
                        <div>
                            {address.state}, {address.city}, {address.zipCode}, {address.country}
                        </div>
                    </span>
                    <span>
                        <Link href={`/account/address/${address.id}`}>
                            <button className="bg-[#32363d] w-20 h-9 rounded-md font-bold cursor-pointer mr-3">
                                Edit
                            </button>
                        </Link>
                        <form action={handleDeleteAddress} className="inline">
                            <input type="hidden" name="addressId" value={address.id} />
                            <button
                                type="submit"
                                className="bg-[#32363d] w-20 h-9 rounded-md font-bold cursor-pointer mr-3"
                                disabled={address.id === defaultAddressId[0].addressId}
                            >
                                Delete
                            </button>
                        </form>
                    </span>
                </span>
                <b className="my-2">{address.phone}</b>
                {address.id !== defaultAddressId[0].addressId &&
                    <form action={handleSetDefaultAddress} className="inline">
                        <input type="hidden" name="addressId" value={address.id} />
                        <button
                            type="submit"
                            className="bg-none font-bold cursor-pointer mt-3 underline"
                        >
                            Set as Default
                        </button>
                    </form>
                }
            </div>
        )
    })
    return (
        <>
            <div className="felx w-[55%] pr-4 border-r-1 border-gray-400">
                <div className="flex flex-col gap-2">
                    <div className="flex w-full justify-between mb-1">
                        <h1 className="font-bold text-xl block">Address Book</h1>
                        <Link href="/account/address/new">
                            <button className="block bg-[#ffb100] px-2 py-0.5 rounded-lg font-bold text-black cursor-pointer mt-2">Add New Address</button>
                        </Link>
                    </div>
                    {...displayAddreeses}
                </div>
            </div>
            <span className="flex flex-col w-[25%] gap-3">
                <h1 className="font-bold text-xl block">Default Address</h1>
                <div className="flex flex-col bg-[#393e46] p-4 w-full max-h-56 rounded-xs mb-3">
                    <b className="font-bold text-lg">{defaultAddress.addressType === "home" ? "Home" : "Office"}</b>
                    <p className="my-2">{defaultAddress.name}</p>
                    <span>
                        {defaultAddress.street} {defaultAddress.buildingNumber}
                    </span>
                    <span>
                        {defaultAddress.state}, {defaultAddress.city}, {defaultAddress.zipCode}, {defaultAddress.country}
                    </span>
                    <b className="my-2">{defaultAddress.phone}</b>

                    <Link href={`/account/address/${defaultAddress.id}`} className="bg-none font-bold cursor-pointer mt-3 underline">Edit Default Address</Link>
                </div>
            </span>
        </>
    )
}
