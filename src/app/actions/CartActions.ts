"use server";

import { db } from "@/lib/db";
import { cartTable, cartItemTable, userTable, InsertCart } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

function nowISO(): string {
    return new Date().toISOString();
}

function cartItemCondition(cartId: number, productId: number) {
    return and(
        eq(cartItemTable.cartId, cartId),
        eq(cartItemTable.productId, productId)
    );
}

async function requireAuth(): Promise<string> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export async function setUserCartId(userId: string, cartId: number) {
    "use server"
    try {
        await db.update(userTable)
            .set({ cartId })
            .where(eq(userTable.id, userId));
        return { success: true };
    } catch (error) {
        console.error("Error setting user cart ID:", error);
        return { success: false, error: "Failed to set user cart ID. Please try again." };
    }
}

export async function createCart() {
    "use server"
    const userId = await requireAuth();
    const now = nowISO();

    try {
        const cartId = await db.transaction(async (tx) => {
            const [cart] = await tx.insert(cartTable)
                .values({
                    userId,
                    createdAt: now,
                    updatedAt: now,
                } satisfies InsertCart)
                .returning({ id: cartTable.id });

            await tx.update(userTable)
                .set({ cartId: cart.id })
                .where(eq(userTable.id, userId));

            return cart.id;
        });

        return { success: true, cartId };
    } catch (error) {
        console.error("Error creating cart:", error);
        return { success: false, error: "Failed to create cart. Please try again." };
    }
}

export async function updateCartItemQuantity(
    cartId: number,
    productId: number,
    quantity: number
) {
    "use server"
    try {
        if (quantity < 1) {
            return await removeFromCart(cartId, productId);
        }

        await db.update(cartItemTable)
            .set({ quantity, updatedAt: nowISO() })
            .where(cartItemCondition(cartId, productId));

        revalidatePath("/cart");
        return { success: true };
    } catch (error) {
        console.error("Error updating cart item quantity:", error);
        return { success: false, error: "Failed to update quantity" };
    }
}

export async function removeFromCart(cartId: number, productId: number) {
    "use server"
    try {
        await db.delete(cartItemTable)
            .where(cartItemCondition(cartId, productId));

        revalidatePath("/cart");
        return { success: true };
    } catch (error) {
        console.error("Error removing item from cart:", error);
        return { success: false, error: "Failed to remove item" };
    }
}

export async function addToCart(
    cartId: number | undefined,
    productId: number,
    quantity: number = 1
) {
    "use server"
    try {
        let finalCartId = cartId;

        // If no cartId is provided, check the user's record for a default cartId.
        if (!finalCartId) {
            const userId = await requireAuth();
            const user = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

            if (user.length > 0 && user[0].cartId) {
                finalCartId = user[0].cartId;
            } else {
                // If the user has no cartId, create a new cart.
                const result = await createCart();
                if (!result.success || !result.cartId) {
                    return { success: false, error: "Failed to create a new cart." };
                }
                finalCartId = result.cartId;
            }
        }

        const existingItem = await db.select()
            .from(cartItemTable)
            .where(cartItemCondition(finalCartId, productId))
            .limit(1);

        if (existingItem.length > 0) {
            await db.update(cartItemTable)
                .set({
                    quantity: existingItem[0].quantity + quantity,
                    updatedAt: nowISO()
                })
                .where(cartItemCondition(finalCartId, productId));
        } else {
            await db.insert(cartItemTable)
                .values({
                    cartId: finalCartId,
                    productId,
                    quantity,
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                });
        }

        revalidatePath("/cart");
        return { success: true, cartId: finalCartId };
    } catch (error) {
        console.error("Error adding item to cart:", error);
        return { success: false, error: "Failed to add item to cart" };
    }
}

export async function clearCart(cartId: number) {
    "use server"
    try {
        await db.delete(cartItemTable)
            .where(eq(cartItemTable.cartId, cartId));

        revalidatePath("/cart");
        return { success: true };
    } catch (error) {
        console.error("Error clearing cart:", error);
        return { success: false, error: "Failed to clear cart" };
    }
}

export async function getCartItemCount(cartId: number): Promise<number> {
    "use server"
    try {
        const items = await db.select()
            .from(cartItemTable)
            .where(eq(cartItemTable.cartId, cartId));

        return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
        console.error("Error getting cart item count:", error);
        return 0;
    }
}
