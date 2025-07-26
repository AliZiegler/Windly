"use server"
import { updateAddress } from "@/app/actions/UserActions";
import { UpdateAddress } from "@/app/components/global/Types";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { addressTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { iraqiProvinces } from "@/app/components/global/Atoms";
import { z } from "zod"
const AddressSchema = z.object({
    name: z.string().min(3, "3 letters at least").max(30, "Name must be at most 30 letters"),
    phone: z.string().min(10, "10 digits at least").max(15, "15 digits at most"),
    state: z.enum(iraqiProvinces),
    country: z.string(),
    city: z.string().min(3, "3 letters at least").max(30, "City must be at most 30 letters"),
    buildingNumber: z.string().min(1, "Enter a building/house number").max(30, "Must be at most 30 characters"),
    street: z.string().min(3, "3 letters at least").max(30, "Street must be at most 30 letters"),
    zipCode: z.string().min(3, "3 characters at least").max(20, "Zip code must be at most 20 characters"),
    addressType: z.enum(["home", "office"]),
});
const provincesOptions = iraqiProvinces.map((province) => {
    return (
        <option key={province} value={province}>{province}</option>
    )
})
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const p = await params
    const addressId = Number(p.id);
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Not authenticated");
    }
    const userId = session.user.id;
    const rawAddress = await db.select().from(addressTable).where(eq(addressTable.id, addressId))
    const address = rawAddress[0]
    const doesUserOwnAddress = address.userId === userId
    if (!doesUserOwnAddress) {
        redirect("/account/address")
    }
    async function handleSubmit(formData: FormData) {
        "use server"
        const values: UpdateAddress = {
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            state: formData.get("state") as string,
            country: "Iraq" as const,
            city: formData.get("city") as string,
            buildingNumber: formData.get("buildingNumber") as string,
            street: formData.get("street") as string,
            zipCode: formData.get("zipCode") as string,
            addressType: formData.get("addressType") as "home" | "office",
        }

        const parsed = AddressSchema.safeParse(values);
        if (!parsed.success) {
            throw new Error(parsed.error.issues.map((i) => `${i.path}: ${i.message}`).join("; "));
        }

        await updateAddress(addressId, parsed.data);
        redirect("/account/address")
    }


    const className = "border-1 border-gray-400 2xl:w-[500px] xl:w-[400px] lg:w-[340px] h-7 p-1"
    return (
        <div className="w-full">
            <h1 className="font-bold text-xl">Edit Address</h1>
            <form action={handleSubmit} className="mt-3 flex flex-col gap-8">
                <div>
                    <h1 className="font-bold text-xl">Contact Information</h1>
                    <span className="flex gap-3 bg-[#393e46] w-full h-28 items-center p-3">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="ml-5">Full Name</label>
                            <input required type="text" name="name" id="name" className={className} defaultValue={address.name} />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="phone" className="ml-5">Telephone</label>
                            <span className="flex">
                                <div className="border-1 border-gray-400 w-12 h-7 text-center pt-0.5"><b>+964</b></div>
                                <input required type="text" name="phone" id="phone" className={className} defaultValue={address.phone} />
                            </span>
                        </div>
                    </span>
                </div>
                <div>
                    <h1 className="font-bold text-xl">Address</h1>
                    <span className="flex flex-col bg-[#393e46] w-full flex-wrap items-center p-3">
                        <span className="flex gap-3 w-full flex-wrap items-center p-3">
                            <div className="flex flex-col">
                                <label htmlFor="state" className="ml-5">State or Province</label>
                                <select name="state" id="state" className={className} defaultValue={address.state}>
                                    {provincesOptions}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="city" className="ml-5">City or Town</label>
                                <input required type="text" name="city" id="city" className={className} defaultValue={address.city} />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="building" className="ml-5">House/Building No</label>
                                <input required type="text" name="buildingNumber" id="buildingNumber" className={className} defaultValue={address.buildingNumber} />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="street" className="ml-5">Street</label>
                                <input required type="text" name="street" id="street" className={className} defaultValue={address.street} />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="zipCode" className="ml-5">Zip/Postal Code</label>
                                <input required type="text" name="zipCode" id="zipCode" className={className} defaultValue={address.zipCode} />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="country" className="ml-5">Country</label>
                                <input required type="text" name="country" id="country" value="Iraq" disabled={true} className={className} />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="addressType" className="ml-5">Address Type</label>
                                <select required name="addressType" id="addressType" className={className} defaultValue={address.addressType}>
                                    <option value="home">Home</option>
                                    <option value="office">office</option>
                                </select>
                            </div>
                            <button type="submit" className="w-32 h-7 bg-[#ffb100] text-black block rounded-md self-end ml-auto cursor-pointer">Save Address</button>
                        </span>
                    </span>
                </div>
            </form>
        </div>
    );
}
