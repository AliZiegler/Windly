"use server";

import { db } from "@/lib/db";
import { cartTable, cartItemTable, userTable, InsertCart, productTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
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

export async function setUserCartId(cartId: number) {
    const userId = await requireAuth();
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
    try {
        if (quantity < 1) {
            return await removeFromCart(cartId, productId);
        }

        const [product] = await db
            .select({ stock: productTable.stock })
            .from(productTable)
            .where(eq(productTable.id, productId))
            .limit(1);

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        if (product.stock < quantity) {
            return { success: false, error: "Insufficient stock available" };
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
    productId: number,
    cartId: number | undefined,
    quantity: number = 1
) {
    try {
        const [product] = await db
            .select({ stock: productTable.stock })
            .from(productTable)
            .where(eq(productTable.id, productId))
            .limit(1);

        if (!product) {
            return { success: false, error: "Product not found" };
        }

        if (product.stock < quantity) {
            return { success: false, error: "Insufficient stock available" };
        }

        let finalCartId = cartId;

        if (!finalCartId) {
            const userId = await requireAuth();
            const user = await db
                .select({ cartId: userTable.cartId })
                .from(userTable)
                .where(eq(userTable.id, userId))
                .limit(1);

            if (user.length > 0 && user[0].cartId) {
                finalCartId = user[0].cartId;
            } else {
                const result = await createCart();
                if (!result.success || !result.cartId) {
                    return { success: false, error: "Failed to create a new cart." };
                }
                finalCartId = result.cartId;
            }
        }

        if (typeof finalCartId !== "number") {
            return { success: false, error: "Cart ID is invalid." };
        }

        const existingItem = await db
            .select({ quantity: cartItemTable.quantity })
            .from(cartItemTable)
            .where(cartItemCondition(finalCartId, productId))
            .limit(1);

        if (existingItem.length > 0) {
            const newQuantity = existingItem[0].quantity + quantity;
            const finalQuantity = Math.min(newQuantity, 10);

            if (finalQuantity > product.stock) {
                return { success: false, error: `Only ${product.stock} items available in stock` };
            }

            await db
                .update(cartItemTable)
                .set({
                    quantity: finalQuantity,
                    updatedAt: nowISO(),
                })
                .where(cartItemCondition(finalCartId, productId));
        } else {
            const finalQuantity = Math.min(quantity, 10);

            if (finalQuantity > product.stock) {
                return { success: false, error: `Only ${product.stock} items available in stock` };
            }

            await db.insert(cartItemTable).values({
                cartId: finalCartId,
                productId,
                quantity: finalQuantity,
                createdAt: nowISO(),
                updatedAt: nowISO(),
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
    try {
        const items = await db.select({ quantity: cartItemTable.quantity })
            .from(cartItemTable)
            .where(eq(cartItemTable.cartId, cartId));

        return items.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
        console.error("Error getting cart item count:", error);
        return 0;
    }
}

export async function orderCart(cartId: number) {
    try {
        const userId = await requireAuth();

        return await db.transaction(async (tx) => {
            const items = await tx
                .select({
                    productId: cartItemTable.productId,
                    quantity: cartItemTable.quantity,
                })
                .from(cartItemTable)
                .where(eq(cartItemTable.cartId, cartId));

            if (items.length === 0) {
                throw new Error("Cart is empty");
            }

            for (const item of items) {
                const [product] = await tx
                    .select({ stock: productTable.stock })
                    .from(productTable)
                    .where(eq(productTable.id, item.productId))
                    .limit(1);

                if (!product || product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ID: ${item.productId}`);
                }
            }

            await tx
                .update(cartTable)
                .set({ updatedAt: nowISO(), status: "ordered" })
                .where(eq(cartTable.id, cartId));

            for (const item of items) {
                await tx
                    .update(productTable)
                    .set({
                        stock: sql`${productTable.stock} - ${item.quantity}`,
                    })
                    .where(eq(productTable.id, item.productId));
            }

            const now = nowISO();
            const [newCart] = await tx.insert(cartTable)
                .values({
                    userId,
                    createdAt: now,
                    updatedAt: now,
                } satisfies InsertCart)
                .returning({ id: cartTable.id });

            await tx.update(userTable)
                .set({ cartId: newCart.id })
                .where(eq(userTable.id, userId));

            return { success: true, newCartId: newCart.id };
        });
    } catch (error) {
        console.error("Error ordering cart:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to order cart"
        };
    }
}

export async function cancelOrder(cartId: number) {
    try {
        return await db.transaction(async (tx) => {
            const [cart] = await tx
                .select({ status: cartTable.status })
                .from(cartTable)
                .where(eq(cartTable.id, cartId))
                .limit(1);

            if (!cart) {
                throw new Error("Cart not found");
            }

            if (cart.status === "ordered" || cart.status === "shipped") {
                const items = await tx
                    .select({
                        productId: cartItemTable.productId,
                        quantity: cartItemTable.quantity,
                    })
                    .from(cartItemTable)
                    .where(eq(cartItemTable.cartId, cartId));

                for (const item of items) {
                    await tx
                        .update(productTable)
                        .set({ stock: sql`${productTable.stock} + ${item.quantity}` })
                        .where(eq(productTable.id, item.productId));
                }
            }

            await tx
                .update(cartTable)
                .set({ updatedAt: nowISO(), status: "cancelled" })
                .where(eq(cartTable.id, cartId));

            return { success: true };
        });
    } catch (error) {
        console.error("Error canceling order:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to cancel order"
        };
    }
}

export async function setCartStatus(cartId: number, status: "active" | "ordered" | "shipped" | "delivered" | "cancelled") {
    try {
        await db.update(cartTable)
            .set({ updatedAt: nowISO(), status })
            .where(eq(cartTable.id, cartId));

        revalidatePath("/cart");
        return { success: true };
    } catch (error) {
        console.error("Error setting cart status:", error);
        return { success: false, error: "Failed to set cart status" };
    }
}

export async function subtractCartItemsQuantities(cartId: number) {
    try {
        return await db.transaction(async (tx) => {
            const items = await tx
                .select({
                    productId: cartItemTable.productId,
                    quantity: cartItemTable.quantity,
                })
                .from(cartItemTable)
                .where(eq(cartItemTable.cartId, cartId));

            if (items.length === 0) {
                throw new Error("No items found in cart");
            }

            for (const item of items) {
                await tx
                    .update(productTable)
                    .set({
                        stock: sql`${productTable.stock} - ${item.quantity}`,
                    })
                    .where(eq(productTable.id, item.productId));
            }

            return { success: true };
        });
    } catch (error) {
        console.error("Error subtracting cart items quantities:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to subtract cart items quantities"
        };
    }
}

export async function restoreCartItemsQuantities(cartId: number) {
    try {
        return await db.transaction(async (tx) => {
            const items = await tx
                .select({
                    productId: cartItemTable.productId,
                    quantity: cartItemTable.quantity,
                })
                .from(cartItemTable)
                .where(eq(cartItemTable.cartId, cartId));

            for (const item of items) {
                await tx
                    .update(productTable)
                    .set({ stock: sql`${productTable.stock} + ${item.quantity}` })
                    .where(eq(productTable.id, item.productId));
            }

            return { success: true };
        });
    } catch (error) {
        console.error("Error restoring cart items quantities:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to restore cart items quantities"
        };
    }
}
export async function syncCartStatus(cartId: number) {
    const [cart] = await db.select({ updatedAt: cartTable.updatedAt, status: cartTable.status })
        .from(cartTable).where(and(eq(cartTable.id, cartId), eq(cartTable.status, "ordered")));
    if (!cart) {
        return { success: false, error: "The status of this cart cannot be synced or it doesnt exist" };
    }
    const orderDate = new Date(cart.updatedAt);
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder >= 1) {
        await db.update(cartTable)
            .set({ updatedAt: nowISO(), status: "shipped" })
            .where(eq(cartTable.id, cartId));
        return
    }
    try {
    } catch (error) {
        console.error("Error syncing cart status:", error);
        return { success: false, error: "Failed to sync cart status" };
    }
}
export async function syncAllCartStatuses() {
    try {
        const carts = await db.select({ id: cartTable.id, updatedAt: cartTable.updatedAt, status: cartTable.status })
            .from(cartTable)
            .where(eq(cartTable.status, "ordered"));
        for (const cart of carts) {
            await syncCartStatus(cart.id);
        }
        return { success: true };
    } catch (error) {
        console.error("Error syncing all cart statuses:", error);
        return { success: false, error: "Failed to sync all cart statuses" };
    }
}
