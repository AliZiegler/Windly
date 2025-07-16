"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { userTable, productTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = ['name', 'phone', 'birthday', 'gender'] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];

export async function updateUserField(field: AllowedField, value: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        if (!ALLOWED_FIELDS.includes(field)) {
            throw new Error(`Invalid field. Allowed fields: ${ALLOWED_FIELDS.join(', ')}`);
        }

        if (field === 'name' && (!value || value.trim().length === 0)) {
            throw new Error("Name cannot be empty");
        }

        const updateData: Partial<Record<AllowedField, string | undefined>> = {};

        // Handle different field types appropriately
        if (field === 'name') {
            // Name is required (notNull), so we don't allow empty values
            updateData[field] = value.trim();
        } else {
            // Other fields can be empty/undefined
            updateData[field] = value.trim() || undefined;
        }

        await db
            .update(userTable)
            .set(updateData)
            .where(eq(userTable.id, session.user.id));

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
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, session.user.id))
            .limit(1);

        if (users.length === 0) {
            throw new Error("User not found");
        }

        // Convert productId to number if your product table uses integer IDs
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

        // Parse the JSON string to get the actual array
        const currentWishlist: number[] = JSON.parse(users[0].wishlist || "[]");
        const wishlist = [...currentWishlist];

        // Toggle productId in wishlist array (keep as string in wishlist)
        const idx = wishlist.indexOf(productId);
        if (idx !== -1) {
            wishlist.splice(idx, 1);
        } else {
            wishlist.push(productId);
        }

        // Convert back to JSON string before persisting
        await db
            .update(userTable)
            .set({ wishlist: JSON.stringify(wishlist) })
            .where(eq(userTable.id, session.user.id));
        revalidatePath("/account/wishlist");

        return {
            success: true,
            wishlist, // Return the actual array, not the JSON string
        };
    } catch (error) {
        console.error("Error updating wishlist:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
