import Link from "next/link";

interface CartSummaryProps {
    subtotal: number;
    shipping: number;
    total: number;
    itemCount: number;
}

export default function CartSummary({
    subtotal,
    shipping,
    total,
    itemCount
}: CartSummaryProps) {
    return (
        <div className="border border-gray-600/50 rounded-2xl p-6 space-y-6" style={{ backgroundColor: "#2a313c" }}>
            <div className="border-b border-gray-600/50 pb-4">
                <h2 className="text-xl font-bold text-gray-100">Order Summary</h2>
                <p className="text-gray-400 text-sm mt-1">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                </p>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subtotal</span>
                    <span className="font-medium text-gray-100">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Shipping</span>
                    <span className="font-medium text-gray-100">
                        {shipping === 0 ? (
                            <span className="text-green-400">FREE</span>
                        ) : (
                            `$${shipping.toFixed(2)}`
                        )}
                    </span>
                </div>

                {shipping === 0 && subtotal >= 50 && (
                    <div className="flex items-center gap-2 text-sm text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Free shipping on orders over $50</span>
                    </div>
                )}

                {shipping > 0 && subtotal < 50 && (
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Add ${(50 - subtotal).toFixed(2)} more for free shipping</span>
                    </div>
                )}


                <div className="border-t border-gray-600/50 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-100">Total</span>
                    <span className="text-2xl font-bold text-gray-100">${total.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-3">
                <Link
                    href="/checkout"
                    className="block w-full py-4 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black 
                    font-bold rounded-xl text-center hover:from-[#e0a000] hover:to-[#e08500] transition-all 
                    duration-200 transform hover:-translate-y-0.5 text-lg"
                    prefetch
                >
                    Proceed to Checkout
                </Link>
            </div>

            <div className="border-t border-gray-600/50 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure 256-bit SSL encryption</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>30-day money back guarantee</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11L4 7" />
                    </svg>
                    <span>Fast & reliable shipping</span>
                </div>
            </div>

            <div className="border-t border-gray-600/50 pt-4">
                <details className="group">
                    <summary
                        className="flex items-center justify-between cursor-pointer text-blue-400 
                        hover:text-blue-300 font-medium transition-colors duration-200">
                        <span>Have a coupon?</span>
                        <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform duration-200"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="mt-3 space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter coupon"
                                className="flex-1 px-3 py-2 border border-gray-600 rounded-lg text-white text-sm focus:outline-none 
                                focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                style={{ backgroundColor: "#1e252d" }}
                            />
                            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium 
                                rounded-lg transition-colors duration-200 text-sm cursor-pointer">
                                Apply
                            </button>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}
