import Link from "next/link";
import { ProductType } from "@/app/components/global/Types";
import { salePrice, updateSearchParams } from "@/app/components/global/Atoms";

type PurchaseBarProps = {
    p: ProductType;
    searchParams: Record<string, string | string[] | undefined>;
    didReview: boolean;
    className?: string;
}

export default function PurchaseBar({ p, searchParams, didReview, className }: PurchaseBarProps) {
    const formattedPrice = salePrice(p.price, p.discount);
    const isReviewShown = searchParams.review === "shown";
    const ReviewShownParams = updateSearchParams(searchParams, "review", "shown");
    const ReviewHiddenParams = updateSearchParams(searchParams, "review", null);

    return (
        <div className={className}>
            <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">{formattedPrice}</h2>
                    {p.discount > 0 && (
                        <span className="text-green-400 text-lg font-semibold">
                            {p.discount}% OFF
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M12 11L4 7" />
                        </svg>
                        <span className="text-sm text-gray-300">
                            {p.shipping.freeShipping ? (
                                <span className="text-green-400 font-semibold">Free Shipping!</span>
                            ) : (
                                `$${p.shipping.cost} shipping`
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-300">
                            Delivery in <span className="font-semibold text-blue-300">{p.shipping.estimatedDays} days</span>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-300 font-semibold">In Stock</span>
                <span className="text-gray-400 text-sm">({p.stock} available)</span>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Quantity:</label>
                <div className="relative">
                    <input
                        type="number"
                        min="1"
                        max={Math.min(p.stock, 10)}
                        defaultValue="1"
                        className="w-full h-12 px-4 bg-gray-700 border border-gray-600 rounded-lg text-center text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                        / {Math.min(p.stock, 10)}
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <button className="w-full h-12 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold rounded-lg transition-all duration-200 hover:from-[#e0a000] hover:to-[#e08500] hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                    Add to Cart
                </button>
                <button className="w-full h-12 bg-gradient-to-r from-[#E67514] to-[#cc5500] text-black font-bold rounded-lg transition-all duration-200 hover:from-[#d06600] hover:to-[#b84400] hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                    Buy Now
                </button>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-600/50">
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Ships from</span>
                        <span className="text-gray-200 font-medium">Windly.com</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sold by</span>
                        <span className="text-gray-200 font-medium">{p.brand}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Returns</span>
                        <Link
                            href="https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7&ref_=dp_ret_policy"
                            className="text-blue-300 hover:text-blue-200 transition-colors duration-200 font-medium"
                        >
                            30-day refund
                        </Link>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Payment</span>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-gray-200 font-medium">Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Button */}
            <Link
                className="w-full h-12 rounded-lg mt-4 border-2 border-gray-500 hover:border-gray-400 flex items-center justify-center text-gray-200 hover:text-white transition-all duration-200 font-medium hover:bg-gray-700/30"
                href={isReviewShown ? `?${ReviewHiddenParams.toString()}` : `?${ReviewShownParams.toString()}`}
                replace={true}
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {didReview && !isReviewShown ? "Edit Review" : !didReview && !isReviewShown ? "Write Review" : "Hide Review"}
            </Link>
        </div>
    )
}
