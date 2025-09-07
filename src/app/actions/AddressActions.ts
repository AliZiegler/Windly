"use server"
import { db } from "@/lib/db";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { UpdateAddress } from "@/app/components/global/Types";
import { isAdmin, requireAuth } from "@/app/actions/AdminActions";
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
        revalidatePath("/account/address");
        return { success: true };
    } catch (error) {
        console.error("Error setting user address:", error);
        return { success: false, error: "Failed to set user address. Please try again." };
    }
}
export async function deleteAddress(addressId: number) {
    const userId = await requireAuth();
    const isUserAdmin = await isAdmin(userId);

    let doesUserOwnAddress = false;
    if (!isUserAdmin) {
        const addressOwner = await db
            .select({ userId: addressTable.userId })
            .from(addressTable)
            .where(eq(addressTable.id, addressId))
            .get();

        doesUserOwnAddress = addressOwner?.userId === userId;
        if (!doesUserOwnAddress) {
            return { success: false, error: "You don't have permission to delete this address" };
        }
    }

    try {
        const [deletedAddress] = await db
            .delete(addressTable)
            .where(eq(addressTable.id, addressId))
            .returning();

        if (!deletedAddress) {
            return { success: false, error: "Address not found" };
        }

        const defaultAddressResult = await db
            .select({ addressId: userTable.addressId })
            .from(userTable)
            .where(eq(userTable.id, deletedAddress.userId))
            .get();

        const currentDefaultAddressId = defaultAddressResult?.addressId;

        if (currentDefaultAddressId === addressId) {
            const [newDefault] = await db
                .select({ id: addressTable.id })
                .from(addressTable)
                .where(eq(addressTable.userId, deletedAddress.userId))
                .orderBy(asc(addressTable.updatedAt))
                .limit(1);

            await db.update(userTable)
                .set({ addressId: newDefault?.id ?? null })
                .where(eq(userTable.id, deletedAddress.userId));
        }

        revalidatePath("/account/address");
        revalidatePath("/admin/addresses");

        return { success: true };
    } catch (error) {
        console.error("Error deleting address:", error);
        return { success: false, error: "Failed to delete address. Please try again." };
    }
}
