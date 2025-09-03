"use server";
import db from "@/lib/db";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { productTable, userTable, banTable } from "@/db/schema";
import type { InsertProduct } from "@/db/schema";
import { auth } from "@/auth";

function nowISO(): string {
    return new Date().toISOString();
}
export async function requireAuth(): Promise<string> {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Not Signed In");
    await requireNotBanned(userId);
    return userId;
}
export async function userExists(userId: string) {
    try {
        const [user] = await db.select().from(userTable).where(eq(userTable.id, userId));
        return !!user;
    } catch (error) {
        console.error("Error checking user existence:", error);
        throw error;
    }
}
export async function productExists(productId: number) {
    try {
        const [product] = await db.select().from(productTable).where(eq(productTable.id, productId));
        return !!product;
    } catch (error) {
        console.error("Error checking product existence:", error);
        throw error;
    }
}
export async function updateProduct(productId: number, data: InsertProduct) {
    await requireAdmin();
    const insertData = { ...data, lastUpdated: nowISO() };
    try {
        const product = await db
            .update(productTable)
            .set(insertData)
            .where(eq(productTable.id, productId))
            .returning();
        revalidatePath("/admin/products");
        revalidatePath(`/admin/products/${productId}`);
        return product;
    }
    catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }

}
export async function addProduct(data: InsertProduct) {
    await requireAdmin();
    const insertData = { ...data, lastUpdated: nowISO() };
    try {
        const [product] = await db.insert(productTable).values(insertData).returning();
        revalidatePath("/admin/products");
        return product;
    }
    catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
}
export async function getAllProductCategories() {
    try {
        const rows = await db
            .selectDistinct({ category: productTable.category })
            .from(productTable);

        const categories = rows
            .map(r => r.category)
            .filter(Boolean)
            .sort();

        return categories;
    } catch (error) {
        console.error("Error fetching product categories:", error);
        throw error;
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
export async function makeAdmin(userId: string) {
    await requireAdmin();
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
export async function isBanned(userId: string) {
    const now = nowISO();

    const bans = await db
        .select({
            id: banTable.id,
            reason: banTable.reason,
            expiresAt: banTable.expiresAt,
            revokedAt: banTable.revokedAt,
        })
        .from(banTable)
        .where(
            and(
                eq(banTable.userId, userId),
                isNull(banTable.revokedAt),
                or(
                    isNull(banTable.expiresAt),
                    gt(banTable.expiresAt, now)
                )
            )
        );

    if (bans.length > 0) {
        return {
            banned: true,
            reason: bans[0].reason,
            expiresAt: bans[0].expiresAt,
        };
    }

    return { banned: false };
}
export async function banUser(userId: string, reason: string, expiresAt: string | null) {
    await requireAdmin()
    const bannedBy = await requireAuth();
    try {
        await db.insert(banTable).values({ userId, reason, expiresAt, bannedBy });
        revalidatePath("/account");
        revalidatePath("/admin/users")
        return { success: true };
    } catch (error) {
        console.error('Error banning user:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
export async function unbanUser(userId: string) {
    await requireAdmin()
    try {
        await db.update(banTable).set({ revokedAt: nowISO() }).where(eq(banTable.userId, userId));
        revalidatePath("/account");
        return { success: true };
    } catch (error) {
        console.error('Error unbanning user:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
export async function requireNotBanned(userId: string) {
    const status = await isBanned(userId);
    if (status.banned) {
        throw new Error(`Access denied: You are banned. Reason: ${status.reason}, Expires at: ${status.expiresAt}`);
    }
    return true;
}
export async function requireAdmin() {
    const userId = await requireAuth();
    const status = await isBanned(userId);
    if (status.banned) {
        throw new Error(`Access denied: You are banned. Reason: ${status.reason}, Expires at: ${status.expiresAt}`);
    }
    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
        throw new Error(`Access denied: You are not an admin`);
    }
    return true;
}
