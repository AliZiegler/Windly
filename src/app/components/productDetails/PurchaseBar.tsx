import Link from "next/link";
import { ProductType } from "@/app/components/global/Products";
import { salePrice } from "@/app/components/global/Atoms";
export default function PurchaseBar({ p, className }: { p: ProductType, className?: string }) {
    const formattedPrice = salePrice(p.price, p.discount);
    return (
        <div className={className}>
            <span className="flex">
                <h1 className="text-3xl font-extralight">{formattedPrice}{p.discount > 0 && ","}</h1>
                <b className="text-green-400 inline ml-1.5 mt-2.5 text-xl">{p.discount > 0 && `${p.discount}% off!`}</b>
            </span>
            <aside className="text-sm text-gray-400">{p.shippingFreeShipping ? "Free Shipping!"
                : `${p.shippingCost} Shipping & Import Charges to Your Country`}</aside>
            <b className="text-lg">delivery in {p.shippingEstimatedDays} days</b>
            <h2 className="text-2xl text-green-500">In Stock</h2>
            <input type="number" min="1" max={p.stock / 2} className="w-48 h-12 border-2 border-gray-300 rounded-md text-center" />
            <span className="w-56 flex flex-col items-center mt-6 gap-4">
                <button className="bg-[#F3C623] w-52 h-9 rounded-3xl  cursor-pointer">Add to Cart</button>
                <button className="bg-[#E67514] w-52 h-9 rounded-3xl cursor-pointer">Buy Now</button>
            </span>
            <table>
                <tbody className="flex flex-col gap-4">
                    <tr className="flex gap-5">
                        <td className="text-gray-400">Ships from</td>
                        <td>Windly.com</td>
                    </tr>
                    <tr className="flex gap-5">
                        <td className="text-gray-400">Sold By</td>
                        <td>{p.brand}</td>
                    </tr>
                    <tr className="flex gap-5">
                        <td className="text-gray-400">Returns</td>
                        <td className="underline text-blue-300">
                            <Link href="https://www.amazon.com/gp/help/customer/display.html?nodeId=GKM69DUUYKQWKWX7&ref_=dp_ret_policy">
                                30-day refund/replacement
                            </Link>
                        </td>
                    </tr>
                    <tr className="flex gap-5">
                        <td className="text-gray-400">Payment</td>
                        <td>Secure transaction</td>
                    </tr>
                </tbody>
            </table>
            <hr className="mt-4 mr-2"></hr>
            <button className="w-48 h-9 rounded-lg mt-6 cursor-pointer border-2 border-gray-300 self-center">Add to List</button>
        </div>
    )
}
