import { db } from "@/lib/db"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { addressTable, userTable } from "@/db/schema"
import { capitalizeFirstLetter } from "@/app/components/global/Atoms"
import Link from "next/link"
import { deleteAddress, setUserAddress } from "@/app/actions/AddressActions"
import { redirect } from "next/navigation"
import { SquarePen, Trash2, Phone, LampDesk, House, Heart, Plus, MapPin } from "lucide-react"

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

    const displayAddresses = userAddresses.map((address) => {
        const isDefault = address.id === defaultAddressId[0].addressId

        return (
            <div key={address.id} className="relative bg-[#393e46] border border-[#2a3038] rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group">
                {isDefault && (
                    <div className="absolute -top-2 left-4">
                        <span className="bg-[#00CAFF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            DEFAULT
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-[#2a2f38] rounded-full">
                        {address.addressType === "home" ? (
                            <House size={16} className="inline" color="#00caff" />
                        ) : (
                            <LampDesk size={16} className="inline" color="#00caff" />
                        )}
                    </div>
                    <h3 className="font-bold text-lg text-white">
                        {capitalizeFirstLetter(address.addressType)}
                    </h3>
                </div>

                <div className="mb-3">
                    <p className="font-semibold text-white text-base">{address.name}</p>
                </div>

                <div className="space-y-1 mb-4">
                    <p className="text-gray-300 text-sm">
                        {address.street} {address.buildingNumber}
                    </p>
                    <p className="text-gray-300 text-sm">
                        {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-300 text-sm">{address.country}</p>
                </div>
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <Phone size={16} className="inline" />
                        <span className="text-gray-300 text-sm font-medium">+964{address.phone}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-3 flex-1">
                        <Link href={`/account/address/${address.id}`} className="flex-1">
                            <button className="w-full bg-[#4a5568] flex items-center justify-center gap-2 hover:bg-[#5a6578] text-white 
                                font-medium px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 
                                focus:ring-[#4a5568] focus:ring-offset-2 focus:ring-offset-[#393e46] text-sm cursor-pointer">
                                <SquarePen size={16} className="inline" />
                                Edit
                            </button>
                        </Link>

                        <form action={handleDeleteAddress} className="flex-1">
                            <input type="hidden" name="addressId" value={address.id} />
                            <button
                                type="submit"
                                disabled={isDefault}
                                className={`w-full flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-md transition-all duration-200 text-sm
                                      ${isDefault
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 focus:outline-none focus:ring-2 cursor-pointer focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-[#393e46]'
                                    }`}
                            >
                                <Trash2 size={16} className="inline" />
                                Delete
                            </button>
                        </form>
                    </div>
                </div>
                {!isDefault && (
                    <div className="mt-3 pt-3 border-t border-[#2a3038]">
                        <form action={handleSetDefaultAddress}>
                            <input type="hidden" name="addressId" value={address.id} />
                            <button
                                type="submit"
                                className="text-[#00CAFF] hover:text-[#00a8d9] cursor-pointer font-medium text-sm underline
                                hover:no-underline transition-all duration-200"
                            >
                                Set as Default Address
                            </button>
                        </form>
                    </div>
                )}
            </div>
        )
    })

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="font-bold text-2xl sm:text-3xl text-white mb-2">Address Book</h1>
                            <p className="text-gray-400 text-sm sm:text-base">Manage your delivery addresses</p>
                        </div>
                        <Link href="/account/address/new">
                            <button className="inline-flex items-center gap-2 justify-center bg-[#ffb100] hover:bg-[#e09d00] text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffb100] focus:ring-offset-2 focus:ring-offset-[#222831] active:scale-95">
                                <Plus size={20} />
                                Add New Address
                            </button>
                        </Link>
                    </div>

                    {userAddresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#393e46] border-2 border-dashed border-[#4a5568] rounded-lg">
                            <MapPin size={40} className="text-[#00CAFF] mb-4" />
                            <h3 className="text-lg font-medium text-gray-300 mb-2">No addresses yet</h3>
                            <p className="text-gray-400 text-center">Add your first address to get started with deliveries</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {displayAddresses}
                        </div>
                    )}
                </div>

                <div className="hidden lg:block w-80 flex-shrink-0">
                    <div className="sticky top-6">
                        <h2 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                            <Heart size={20} fill="#00CAFF" className="text-[#00CAFF]" />
                            Default Address
                        </h2>

                        <div className="bg-[#393e46] border-2 border-[#00CAFF]/30 rounded-lg p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-[#00CAFF]/20 rounded-full">
                                    {defaultAddress.addressType === "home" ? (
                                        <House size={16} className="text-[#00CAFF]" />
                                    ) : (
                                        <LampDesk size={16} className="text-[#00CAFF]" />
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-white">
                                    {defaultAddress.addressType === "home" ? "Home" : "Office"}
                                </h3>
                            </div>

                            <div className="space-y-3 mb-4">
                                <p className="font-semibold text-white">{defaultAddress.name}</p>

                                <div className="space-y-1 text-sm text-gray-300">
                                    <p>{defaultAddress.street} {defaultAddress.buildingNumber}</p>
                                    <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}</p>
                                    <p>{defaultAddress.country}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="inline" />
                                    <span className="text-gray-300 text-sm">+964{defaultAddress.phone}</span>
                                </div>
                            </div>

                            <Link
                                href={`/account/address/${defaultAddress.id}`}
                                className="inline-flex items-center justify-center gap-2 w-full bg-[#2a2f38] hover:bg-[#3a3f48] text-white font-medium px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:ring-offset-2 focus:ring-offset-[#393e46] text-sm"
                            >
                                <SquarePen size={16} className="inline" />
                                Edit Default Address
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
