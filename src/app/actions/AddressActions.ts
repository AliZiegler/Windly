"use server"
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { UpdateAddress } from "@/app/components/global/Types";
import { requireAuth } from "@/app/actions/AdminActions";
import { addressTable, userTable, InsertAddress } from "@/db/schema";

export async function addAddress(address: Omit<InsertAddress, "userId">) {
    const userId = await requireAuth();
    const insertValues = { ...address, updatedAt: new Date().toISOString(), userId: userId };
    try {
        await db.insert(addressTable).values(insertValues);
        const userDefaultAddress = await db.select({ addressId: userTable.addressId }).from(userTable).where(eq(userTable.id, userId));
        if (userDefaultAddress.length === 0 || !userDefaultAddress) {
            await db.update(userTable).set({ addressId: insertValues.id }).where(eq(userTable.id, insertValues.userId));
        }
        revalidatePath("/user/addresses");
        return { success: true };
    } catch (error) {
        console.error("Error adding address:", error);
        return { success: false, error: "Failed to add address. Please try again." };
    }
}
export async function updateAddress(addressId: number, input: UpdateAddress) {
    if (!Object.keys(input).length) {
        return { success: false, error: "No fields provided for update." };
    }

    try {
        await db
            .update(addressTable)
            .set({
                ...input,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(addressTable.id, addressId));

        revalidatePath("/user/addresses");

        return { success: true };
    } catch (error) {
        console.error("Error updating address:", error);
        return { success: false, error: "Failed to update address. Please try again." };
    }
}
export async function setUserAddress(addressId: number, userId: string) {
    try {
        await db.update(userTable).set({ addressId }).where(eq(userTable.id, userId));
        revalidatePath("/user/addresses");
        return { success: true };
    } catch (error) {
        console.error("Error setting user address:", error);
        return { success: false, error: "Failed to set user address. Please try again." };
    }
}
export async function deleteAddress(addressId: number, userId: string) {
    const callerId = await requireAuth();
    if (callerId !== userId) {
        return { success: false, error: "It's not your address" };
    }
    try {
        const userAddresses = await db.select({
            addressId: addressTable.id,
            updatedAt: addressTable.updatedAt
        })
            .from(addressTable)
            .where(eq(addressTable.userId, userId));
        const defaultAddressResult = await db.select({ addressId: userTable.addressId })
            .from(userTable)
            .where(eq(userTable.id, userId));

        const currentDefaultAddressId = defaultAddressResult[0]?.addressId;

        const addressesSorted = userAddresses.sort((a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );

        if (currentDefaultAddressId !== addressId) {
            await db.delete(addressTable).where(eq(addressTable.id, addressId));
            revalidatePath("/user/addresses");
            return { success: true };
        } else {
            if (userAddresses.length <= 1) {
                await db.delete(addressTable).where(eq(addressTable.id, addressId));
                await db.update(userTable)
                    .set({ addressId: null })
                    .where(eq(userTable.id, userId));

                revalidatePath("/user/addresses");
                return { success: true };
            }

            const newDefaultAddress = addressesSorted.find(addr => addr.addressId !== addressId);

            await db.delete(addressTable).where(eq(addressTable.id, addressId));

            if (newDefaultAddress) {
                await db.update(userTable)
                    .set({ addressId: newDefaultAddress.addressId })
                    .where(eq(userTable.id, userId));
            }

            revalidatePath("/user/addresses");
            return { success: true };
        }
    } catch (error) {
        console.error("Error deleting address:", error);
        return { success: false, error: "Failed to delete address. Please try again." };
    }
}
