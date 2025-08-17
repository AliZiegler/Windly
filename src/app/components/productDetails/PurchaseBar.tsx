import Link from "next/link";
import AddAndBuy from "./Add&Buy";
import { ProductType } from "@/app/components/global/Types";
import { salePrice, updateSearchParams } from "@/app/components/global/Atoms";
import { addToCart } from "@/app/actions/CartActions";
import { redirect } from "next/navigation";
import { Check, Clock, LockKeyhole, SquarePen } from "lucide-react";

async function handleAddToCart(productId: number, quantity: number) {
    "use server"
    await addToCart(productId, undefined, quantity);
}

async function handleBuyNow(productId: number, quantity: number) {
    "use server"
    await addToCart(productId, undefined, quantity);
    redirect("/cart");
}

type PurchaseBarProps = {
    p: ProductType;
    searchParams: Record<string, string | string[] | undefined>;
    didReview: boolean;
    className?: string;
}

export default function PurchaseBar({ p, searchParams, didReview, className, }: PurchaseBarProps) {
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
                        <Check className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300">
                            {p.shipping.freeShipping ? (
                                <span className="text-green-400 font-semibold">Free Shipping!</span>
                            ) : (
                                `$${p.shipping.cost} shipping`
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-300">
                            Delivery in <span className="font-semibold text-blue-300">{p.shipping.estimatedDays} days</span>
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-semibold">In Stock</span>
                <span className="text-gray-400 text-sm">({p.stock} available)</span>
            </div>
            <AddAndBuy stock={p.stock} productId={p.id} buyAction={handleBuyNow} addAction={handleAddToCart} />
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
                            <LockKeyhole className="w-4 h-4 text-green-400" />
                            <span className="text-gray-200 font-medium">Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <Link
                className="w-full h-12 rounded-lg mt-4 border-2 border-gray-500 hover:border-gray-400 flex items-center justify-center text-gray-200 hover:text-white transition-all duration-200 font-medium hover:bg-gray-700/30"
                href={isReviewShown ? `?${ReviewHiddenParams.toString()}` : `?${ReviewShownParams.toString()}`}
                replace={true}
            >
                <SquarePen className="w-4 h-4 mr-2" />
                {didReview && !isReviewShown ? "Edit Review" : !didReview && !isReviewShown ? "Write Review" : "Hide Review"}
            </Link>
        </div>
    )
}
