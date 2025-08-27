import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { addressTable, userTable } from "@/db/schema"
import { capitalizeFirstLetter } from "@/app/components/global/Atoms"
import { Phone, LampDesk, House, Heart, MapPin } from "lucide-react"

export default async function UserAddressBook({ id }: { id: string }) {
    const userAddresses = await db.select().from(addressTable).where(eq(addressTable.userId, id))
    const defaultAddressId = await db.select({ addressId: userTable.addressId }).from(userTable).where(eq(userTable.id, id))
    const defaultAddress = userAddresses.find((address) => address.id === defaultAddressId[0].addressId)

    if (!defaultAddress) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#1c2129] border-2 border-dashed border-[#4a5568] rounded-lg">
                <MapPin size={40} className="text-[#00CAFF] mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No addresses yet</h3>
            </div>

        )
    }

    const displayAddresses = userAddresses.map((address) => {
        const isDefault = address.id === defaultAddressId[0].addressId

        return (
            <div key={address.id} className="relative bg-[#1c2129] border border-[#2a3038] rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200 group">
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
                        <div className="flex-1">
                        </div>

                        <form className="flex-1">
                            <input type="hidden" name="addressId" value={address.id} />
                        </form>
                    </div>
                </div>
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
                    </div>

                    {!defaultAddress ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#1c2129] border-2 border-dashed border-[#4a5568] rounded-lg">
                            <MapPin size={40} className="text-[#00CAFF] mb-4" />
                            <h3 className="text-lg font-medium text-gray-300 mb-2">No addresses yet</h3>
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

                        <div className="bg-[#1c2129] border-2 border-[#00CAFF]/30 rounded-lg p-6 shadow-lg">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
