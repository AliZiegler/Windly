import { signIn, auth } from "@/auth";
import { db } from "@/lib/db";
import { cartTable, cartItemTable, productTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { applyDiscount, formatPrice, urlString } from "@/app/components/global/Atoms";
import CartItemControls from "@/app/components/cart/CartItemControls";
import CartSummary from "@/app/components/cart/CartSummary";
import { UserRound, ShoppingCart, ShoppingBasket, ChevronLeft } from "lucide-react";

async function SignIn() {
    "use server";
    await signIn("google");
}

export default async function CartPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#222831" }}>
                <div className="text-center p-8 border border-gray-600/50 rounded-2xl max-w-md" style={{ backgroundColor: "#2a313c" }}>
                    <UserRound size={60} color="#99a1af" className="mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-200 mb-4">Sign In Required</h2>
                    <p className="text-gray-400 mb-6">Please sign in to view your cart</p>
                    <form action={SignIn}>
                        <button
                            className="inline-flex cursor-pointer items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] 
                            to-[#ff9500] text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const [userCart] = await db
        .select()
        .from(cartTable)
        .where(and(eq(cartTable.userId, session.user.id), eq(cartTable.status, "active")))
        .limit(1);

    if (!userCart) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Shopping Cart</h1>
                        <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium">
                            ← Continue Shopping
                        </Link>
                    </div>
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#2a313c]">
                            <ShoppingCart size={40} color="#99a1af" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-200 mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Looks like you have not added any items to your cart yet</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black 
                            font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <ShoppingBasket size={20} color="black" />
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const cartItems = await db
        .select({
            cartId: cartItemTable.cartId,
            productId: cartItemTable.productId,
            quantity: cartItemTable.quantity,
            createdAt: cartItemTable.createdAt,
            productName: productTable.name,
            productPrice: productTable.price,
            productDiscount: productTable.discount,
            productStock: productTable.stock,
            productImg: productTable.img,
            productImgAlt: productTable.imgAlt,
        })
        .from(cartItemTable)
        .innerJoin(productTable, eq(cartItemTable.productId, productTable.id))
        .where(eq(cartItemTable.cartId, userCart.id));

    if (!cartItems.length) {
        return (
            <div className="text-center py-16 text-gray-200">
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-gray-400 mb-8">Start adding some items to see them here</p>
                <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-xl">
                    Start Shopping
                </Link>
            </div>
        );
    }

    const subtotalPrice = cartItems.reduce((sum, item) => {
        const discountedCents = applyDiscount(Math.round(item.productPrice), item.productDiscount);
        return sum + discountedCents * item.quantity;
    }, 0);

    const shippingPrice = subtotalPrice > 50 ? 0 : 10;
    const totalPrice = subtotalPrice + shippingPrice;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Shopping Cart</h1>
                        <p className="text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
                    </div>
                    <Link href="/" className="group flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium">
                        <ChevronLeft size={18} className="text-blue-400 group-hover:text-blue-300" />
                        Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const itemPriceCents = applyDiscount(Math.round(item.productPrice), item.productDiscount);
                            const itemTotalCents = itemPriceCents * item.quantity;

                            return (
                                <div key={item.productId} className="border border-gray-600/50 rounded-2xl p-4 sm:p-6" style={{ backgroundColor: "#2a313c" }}>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href={`/${urlString(item.productName)}`} className="flex-shrink-0">
                                            <div
                                                className="relative w-24 aspect-square rounded-lg overflow-hidden"
                                                style={{ backgroundColor: "#1e252d" }}
                                            >
                                                <Image
                                                    src={item.productImg || "/images/placeholder.png"}
                                                    alt={item.productImgAlt || item.productName}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 640px) 100vw, 96px"
                                                />
                                            </div>
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row justify-between gap-2">
                                                <div>
                                                    <Link href={`/${urlString(item.productName)}`}
                                                        className="text-lg font-semibold text-gray-100 hover:text-blue-400">
                                                        {item.productName}
                                                    </Link>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xl font-bold text-gray-100">{formatPrice(itemPriceCents)}</span>
                                                        {item.productDiscount > 0 && (
                                                            <span className="text-sm text-green-400 font-medium">{item.productDiscount}% off</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-400 mt-1">In Stock ({item.productStock} available)</p>
                                                </div>

                                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4">
                                                    <CartItemControls
                                                        cartId={userCart.id}
                                                        productId={item.productId}
                                                        quantity={item.quantity}
                                                        maxQuantity={Math.min(item.productStock, 10)}
                                                    />
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-gray-100">{formatPrice(itemTotalCents)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <CartSummary
                                subtotal={subtotalPrice}
                                shipping={shippingPrice}
                                total={totalPrice}
                                itemCount={cartItems.length}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
