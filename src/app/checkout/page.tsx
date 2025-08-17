import { signIn, auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { orderCart } from "@/app/actions/CartActions";
import { cartTable, cartItemTable, productTable, addressTable, userTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { applyDiscount, formatPrice, } from "@/app/components/global/Atoms";
import CheckoutSteps from "@/app/components/checkout/CheckoutSteps";
import PaymentForm from "@/app/components/checkout/PaymentForm";
import { UserRound, ShoppingCart, ChevronLeft, LockKeyhole, CircleCheck, FastForward } from "lucide-react";

async function SignIn() {
    "use server";
    await signIn("google");
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await auth();
    const sp = await searchParams;
    const userId = session?.user?.id;
    const currentStep = Number(sp.step || "1");

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#222831" }}>
                <div className="text-center p-8 border border-gray-600/50 rounded-2xl max-w-md" style={{ backgroundColor: "#2a313c" }}>
                    <UserRound size={64} className="mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-200 mb-4">Sign In Required</h2>
                    <p className="text-gray-400 mb-6">Please sign in to proceed with checkout</p>
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

    const rawUserCart = await db
        .select()
        .from(cartTable)
        .where(and(eq(cartTable.userId, userId), eq(cartTable.status, "active")))
        .limit(1);
    const userCart = rawUserCart[0];

    if (!userCart) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2a313c" }}>
                            <ShoppingCart size={40} color="gray" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-200 mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">Add some items to your cart before proceeding to checkout</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black 
                            font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 transform hover:-translate-y-0.5"
                        >
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
    async function handleOrder() {
        "use server";
        await orderCart(userCart.id);
        redirect("/");
    }

    if (!cartItems.length) {
        return (
            <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-200 mb-2">Your cart is empty</h2>
                        <p className="text-gray-400 mb-8">Add some items to your cart before proceeding to checkout</p>
                        <Link href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-xl">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const userAddresses = await db
        .select()
        .from(addressTable)
        .where(eq(addressTable.userId, userId));
    const rawUserDefaultAddress = await db.select({ id: userTable.addressId }).from(userTable).where(eq(userTable.id, userId)).limit(1);
    const defaultAddressId = rawUserDefaultAddress[0].id

    const subtotalPrice = cartItems.reduce((sum, item) => {
        const discountedPrice = applyDiscount(item.productPrice, item.productDiscount);
        return sum + discountedPrice * item.quantity;
    }, 0);

    const shippingPrice = subtotalPrice >= 50 ? 0 : 10;
    const totalPrice = subtotalPrice + shippingPrice;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: "#222831" }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">Checkout</h1>
                        <p className="text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} ready for checkout</p>
                    </div>
                    <Link href="/cart" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                        <ChevronLeft size={16} />
                        Back to Cart
                    </Link>
                </div>

                <CheckoutSteps currentStep={currentStep} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">


                        {currentStep === 1 && (
                            <div className="border border-gray-600/50 rounded-2xl p-6 mb-6" style={{ backgroundColor: "#2a313c" }}>
                                <h2 className="text-xl font-bold text-gray-100 mb-6">Review Your Order</h2>
                                <div className="space-y-4">
                                    {cartItems.map((item) => {
                                        const itemPrice = applyDiscount(item.productPrice, item.productDiscount);
                                        const itemTotal = itemPrice * item.quantity;

                                        return (
                                            <div key={item.productId} className="flex items-center gap-4 p-4 border border-gray-600/30 rounded-xl" style={{ backgroundColor: "#1e252d" }}>
                                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: "#222831" }}>
                                                    <Image
                                                        src={item.productImg || "/images/placeholder.png"}
                                                        alt={item.productImgAlt || item.productName}
                                                        fill
                                                        className="object-cover"
                                                        sizes="64px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-100 truncate">{item.productName}</h3>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-lg font-bold text-gray-100">{formatPrice(itemPrice)}</span>
                                                        {item.productDiscount > 0 && (
                                                            <span className="text-sm text-green-400 font-medium">{item.productDiscount}% off</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-100">{formatPrice(itemTotal)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}


                        {currentStep === 2 && (
                            <div className="border border-gray-600/50 rounded-2xl p-6 mb-6" style={{ backgroundColor: "#2a313c" }}>
                                <h2 className="text-xl font-bold text-gray-100 mb-6">Shipping Information</h2>

                                {userAddresses.length > 0 ? (
                                    <div className="space-y-4 mb-6">
                                        {userAddresses.map((address) => (
                                            <div key={address.id} className="border border-gray-600/30 rounded-xl p-4" style={{ backgroundColor: "#1e252d" }}>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-gray-100">{address.name}</h3>
                                                            <span className="px-2 py-1 text-xs rounded-full capitalize text-gray-300" style={{ backgroundColor: "#222831" }}>
                                                                {address.addressType}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm">{address.street}, {address.buildingNumber}</p>
                                                        <p className="text-gray-300 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                                                        <p className="text-gray-300 text-sm">{address.phone}</p>
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="address"
                                                        value={address.id}
                                                        defaultChecked={address.id === defaultAddressId}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 mb-4">No saved addresses found</p>
                                        <Link
                                            href="/account/address/new"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                                font-medium rounded-lg transition-colors"
                                        >
                                            Add Address
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                        {currentStep === 3 && (
                            <PaymentForm />
                        )}

                        <div className="flex justify-between">
                            <Link
                                href={currentStep > 1 ? `/checkout?step=${currentStep - 1}` : "/cart"}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-600/50 rounded-xl text-gray-300 hover:text-gray-100 hover:border-gray-500 transition-all duration-200"
                                style={{ backgroundColor: "#2a313c" }}
                            >
                                <ChevronLeft size={16} />
                                {currentStep === 1 ? "Back to Cart" : "Previous"}
                            </Link>

                            {currentStep < 3 ? (
                                <Link
                                    href={`/checkout?step=${currentStep + 1}`}
                                    className="px-8 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                                >
                                    Continue
                                </Link>
                            ) : (
                                <form action={handleOrder}>
                                    <button
                                        className="px-8 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold 
                                        rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200">
                                        Place Order
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <div className="border border-gray-600/50 rounded-2xl p-6 space-y-6" style={{ backgroundColor: "#2a313c" }}>
                                <div className="border-b border-gray-600/50 pb-4">
                                    <h2 className="text-xl font-bold text-gray-100">Order Summary</h2>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {cartItems.slice(0, 3).map((item) => {
                                        const itemPrice = applyDiscount(Math.round(item.productPrice * 100), item.productDiscount);
                                        const itemTotal = itemPrice * item.quantity;

                                        return (
                                            <div key={item.productId} className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: "#1e252d" }}>
                                                    <Image
                                                        src={item.productImg || "/images/placeholder.png"}
                                                        alt={item.productImgAlt || item.productName}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-100 text-sm truncate">{item.productName}</p>
                                                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-100 text-sm">{formatPrice(itemTotal)}</p>
                                            </div>
                                        );
                                    })}
                                    {cartItems.length > 3 && (
                                        <p className="text-gray-400 text-sm">+{cartItems.length - 3} more items</p>
                                    )}
                                </div>

                                <div className="border-t border-gray-600/50 pt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">Subtotal</span>
                                        <span className="text-gray-100 font-medium">{formatPrice(subtotalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300">Shipping</span>
                                        <span className="text-gray-100 font-medium">
                                            {shippingPrice === 0 ? (
                                                <span className="text-green-400">FREE</span>
                                            ) : (
                                                formatPrice(shippingPrice)
                                            )}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-600/50 pt-3">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span className="text-gray-100">Total</span>
                                            <span className="text-gray-100">{formatPrice(totalPrice)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-600/50 pt-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <LockKeyhole size={15} color="#05df72" />
                                        <span>Secure 256-bit SSL encryption</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <CircleCheck size={15} color="#51a2ff" />
                                        <span>30-day money back guarantee</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                        <FastForward size={15} color="#fdc700" />
                                        <span>Fast & reliable shipping</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
