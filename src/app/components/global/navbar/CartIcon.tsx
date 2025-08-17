import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userTable, cartItemTable } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { ShoppingCart } from "lucide-react";

export default async function CartIcon() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return (
            <CartIconDisplay itemCount={0} />
        );
    }

    const user = await db
        .select({ cartId: userTable.cartId })
        .from(userTable)
        .where(eq(userTable.id, userId))
        .limit(1);

    const cartId = user[0]?.cartId;

    if (!cartId) {
        return (
            <CartIconDisplay itemCount={0} />
        );
    }

    const result = await db
        .select({
            count: count(cartItemTable.quantity),
        })
        .from(cartItemTable)
        .where(eq(cartItemTable.cartId, cartId));

    const itemCount = result[0]?.count || 0;

    return (
        <CartIconDisplay itemCount={itemCount} />
    );
}

function CartIconDisplay({ itemCount }: { itemCount: number }) {
    return (
        <Link href="/cart" prefetch>
            <div className="flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105">
                <div className="w-14 h-14 flex items-center justify-center cursor-pointer">
                    <ShoppingCart
                        size={32}
                        strokeWidth={1.5}
                    />
                </div>
                {itemCount > 0 && (
                    <div className="absolute -top-0 -right-1 rounded-full bg-red-500 w-6 h-6 flex items-center justify-center text-white text-sm font-medium">
                        {itemCount > 99 ? "99+" : itemCount}
                    </div>
                )}
            </div>
        </Link>
    );
}
