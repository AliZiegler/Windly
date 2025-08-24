"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { eq, and } from "drizzle-orm"
import { userTable, productTable, wishlistTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = ['name', 'phone', 'birthday', 'gender'] as const;
const ALLOWED_ROLES = ['user', 'seller'] as const;
type AllowedField = typeof ALLOWED_FIELDS[number];
type AllowedRole = typeof ALLOWED_ROLES[number];
export async function requireAuth(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized, Signin first");
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
export async function isAdmin(userId: string) {
    const [userRole] = await db.select({ role: userTable.role }).from(userTable).where(eq(userTable.id, userId));
    return userRole.role === 'admin';
}
export async function isCallerAdmin() {
    const userId = await requireAuth();
    return isAdmin(userId);
}
export async function setUserRole(role: AllowedRole) {
    const userId = await requireAuth()
    try {
        if (!ALLOWED_ROLES.includes(role)) {
            throw new Error(`Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`);
        }
        await db.update(userTable).set({ role: role }).where(eq(userTable.id, userId));
        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
export async function makeAdmin(userId: string) {
    const callerId = await requireAuth()
    const isCallerAdmin = isAdmin(callerId)
    if (!isCallerAdmin) {
        return { success: false, error: "You are not an admin" };
    }
    try {
        await db.update(userTable).set({ role: 'admin' }).where(eq(userTable.id, userId));
        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
