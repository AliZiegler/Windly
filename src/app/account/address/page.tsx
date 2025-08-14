import { db } from "@/lib/db"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import { addressTable, userTable } from "@/db/schema"
import { capitalizeFirstLetter } from "@/app/components/global/Atoms"
import Link from "next/link"
import { deleteAddress, setUserAddress } from "@/app/actions/AddressActions"
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
                            <svg className="w-4 h-4 text-[#00CAFF]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-[#00CAFF]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
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
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-300 text-sm font-medium">+964{address.phone}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2 flex-1">
                        <Link href={`/account/address/${address.id}`} className="flex-1">
                            <button className="w-full bg-[#4a5568] hover:bg-[#5a6578] text-white font-medium px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4a5568] focus:ring-offset-2 focus:ring-offset-[#393e46] text-sm">
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        </Link>

                        <form action={handleDeleteAddress} className="flex-1">
                            <input type="hidden" name="addressId" value={address.id} />
                            <button
                                type="submit"
                                disabled={isDefault}
                                className={`w-full font-medium px-4 py-2 rounded-md transition-all duration-200 text-sm ${isDefault
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-[#393e46]'
                                    }`}
                            >
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
                                className="text-[#00CAFF] hover:text-[#00a8d9] font-medium text-sm underline hover:no-underline transition-all duration-200"
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
                            <button className="inline-flex items-center justify-center bg-[#ffb100] hover:bg-[#e09d00] text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ffb100] focus:ring-offset-2 focus:ring-offset-[#222831] active:scale-95">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add New Address
                            </button>
                        </Link>
                    </div>

                    {userAddresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#393e46] border-2 border-dashed border-[#4a5568] rounded-lg">
                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
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
                            <svg className="w-5 h-5 text-[#00CAFF]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            Default Address
                        </h2>

                        <div className="bg-[#393e46] border-2 border-[#00CAFF]/30 rounded-lg p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-[#00CAFF]/20 rounded-full">
                                    {defaultAddress.addressType === "home" ? (
                                        <svg className="w-4 h-4 text-[#00CAFF]" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-[#00CAFF]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
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
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-gray-300 text-sm">+964{defaultAddress.phone}</span>
                                </div>
                            </div>

                            <Link
                                href={`/account/address/${defaultAddress.id}`}
                                className="inline-flex items-center justify-center w-full bg-[#2a2f38] hover:bg-[#3a3f48] text-white font-medium px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:ring-offset-2 focus:ring-offset-[#393e46] text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Default Address
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
