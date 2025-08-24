"use server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { productTable, InsertProduct } from "@/db/schema";
import { isCallerAdmin } from "@/app/actions/UserActions";
// import { auth } from "@/auth";

function nowISO(): string {
    return new Date().toISOString();
}
// async function requireAuth(): Promise<string> {
//  const session = await auth();
// if (!session?.user?.id) throw new Error("Unauthorized");
//return session.user.id;
// }
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
