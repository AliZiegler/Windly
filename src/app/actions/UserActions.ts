"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { userTable, productTable, addressTable, wishlistTable } from "@/db/schema";
import type { InsertAddress } from "@/db/schema";
import type { UpdateAddress } from "@/app/components/global/Types";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = ['name', 'phone', 'birthday', 'gender'] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];
export async function requireAuth(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}


export async function updateUserField(field: AllowedField, value: string) {
    const userId = await requireAuth();
    try {
        if (!ALLOWED_FIELDS.includes(field)) {
            throw new Error(`Invalid field. Allowed fields: ${ALLOWED_FIELDS.join(', ')}`);
        }

        if (field === 'name' && (!value || value.trim().length === 0)) {
            throw new Error("Name cannot be empty");
        }

        const updateData: Partial<Record<AllowedField, string | undefined>> = {};

        if (field === 'name') {
            updateData[field] = value.trim();
        } else {
            updateData[field] = value.trim() || undefined;
        }

        await db
            .update(userTable)
            .set(updateData)
            .where(eq(userTable.id, userId));

        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error('Error updating user field:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function updateUserName(name: string) {
    return updateUserField('name', name);
}

export async function updateUserPhone(phone: string) {
    return updateUserField('phone', phone);
}

export async function updateUserBirthday(birthday: string) {
    return updateUserField('birthday', birthday);
}

export async function updateUserGender(gender: string) {
    return updateUserField('gender', gender);
}

export async function updateWishlist(productId: number) {
    const userId = await requireAuth();
    try {
        if (isNaN(productId)) {
            throw new Error("Invalid product ID");
        }

        const productExists = await db
            .select({ id: productTable.id })
            .from(productTable)
            .where(eq(productTable.id, productId))
            .limit(1);

        if (productExists.length === 0) {
            throw new Error("Product not found");
        }

        const existingWishlistItem = await db
            .select()
            .from(wishlistTable)
            .where(
                and(
                    eq(wishlistTable.userId, userId),
                    eq(wishlistTable.productId, productId)
                )
            )
            .limit(1);

        if (existingWishlistItem.length > 0) {
            await db
                .delete(wishlistTable)
                .where(
                    and(
                        eq(wishlistTable.userId, userId),
                        eq(wishlistTable.productId, productId)
                    )
                );
        } else {
            await db
                .insert(wishlistTable)
                .values({
                    userId: userId,
                    productId: productId
                });
        }

        const updatedWishlist = await db
            .select({ productId: wishlistTable.productId })
            .from(wishlistTable)
            .where(eq(wishlistTable.userId, userId));

        const wishlistProductIds = updatedWishlist.map(item => item.productId);

        revalidatePath("/account/wishlist");

        return {
            success: true,
            wishlist: wishlistProductIds,
        };
    } catch (error) {
        console.error("Error updating wishlist:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

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
