"use server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { productTable, userTable, InsertProduct } from "@/db/schema";
import { auth } from "@/auth";

function nowISO(): string {
    return new Date().toISOString();
}
async function requireAuth(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}
export async function updateProduct(productId: number, data: InsertProduct) {
    if (!isCallerAdmin()) {
        return { success: false, error: "You are not an Admin" };
    }
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
    if (!isCallerAdmin()) {
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
