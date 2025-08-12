import { signIn, auth } from "@/auth";
import { db } from "@/lib/db";
import { cartTable, cartItemTable, productTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { applyDiscount, formatPrice, urlString } from "@/app/components/global/Atoms";
import CartItemControls from "@/app/components/cart/CartItemControls";
import CartSummary from "@/app/components/cart/CartSummary";

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
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
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

    const userCart = await db
        .select()
        .from(cartTable)
        .where(and(eq(cartTable.userId, session.user.id), eq(cartTable.status, "active")))
        .limit(1);

    if (!userCart.length) {
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
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 32 32">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M29.46 10.14A2.94 2.94 0 0 0 27.1 9H10.22L8.76 6.35A2.67 2.67 0 0 0 6.41 5H3a1 1 0 0 0 0 2h3.41a.68.68 0 0 1 .6.31l1.65 3 .86 9.32a3.84 3.84 0 0 0 4 3.38h10.37a3.92 3.92 0 0 0 3.85-2.78l2.17-7.82a2.58 2.58 0 0 0-.45-2.27z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-200 mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Looks like you have not added any items to your cart yet</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black 
                            font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11h8m-4 0v6m-4-6h8" />
                            </svg>
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
        .where(eq(cartItemTable.cartId, userCart[0].id));

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

    // Calculate subtotal in cents
    const subtotalCents = cartItems.reduce((sum, item) => {
        const discountedCents = applyDiscount(Math.round(item.productPrice * 100), item.productDiscount);
        return sum + discountedCents * item.quantity;
    }, 0);

    const shippingCents = subtotalCents > 5000 ? 0 : 999;
    const totalCents = subtotalCents + shippingCents;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Shopping Cart</h1>
                        <p className="text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Continue Shopping
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const itemPriceCents = applyDiscount(Math.round(item.productPrice * 100), item.productDiscount);
                            const itemTotalCents = itemPriceCents * item.quantity;

                            return (
                                <div key={item.productId} className="border border-gray-600/50 rounded-2xl p-4 sm:p-6" style={{ backgroundColor: "#2a313c" }}>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href={`/${urlString(item.productName)}`} className="flex-shrink-0">
                                            <div className="relative w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden" style={{ backgroundColor: "#1e252d" }}>
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
                                                        cartId={userCart[0].id}
                                                        productId={item.productId}
                                                        quantity={item.quantity}
                                                        maxQuantity={Math.min(item.productStock, 10)}
                                                    />
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-gray-100">{formatPrice(itemTotalCents)}</div>
                                                        {item.quantity > 1 && (
                                                            <div className="text-sm text-gray-400">{formatPrice(itemPriceCents)} each</div>
                                                        )}
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
                                subtotal={subtotalCents / 100}
                                shipping={shippingCents / 100}
                                total={totalCents / 100}
                                itemCount={cartItems.length}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
