import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/productDetails/AllRatings";
import { urlString, applyDiscount } from "@/app/components/global/Atoms.ts";
import { DisplayProduct } from "@/app/components/global/Types";
import { addToCart } from "@/app/actions/CartActions";

export default function Product({
    id,
    name,
    img,
    price,
    discount,
    description,
    rating,
}: DisplayProduct) {
    const numericPrice = Number(price);
    const numericDiscount = Number(discount);
    const finalPrice = applyDiscount(numericPrice, numericDiscount);

    const formatCurrency = (value: number) =>
        value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formattedPrice = formatCurrency(finalPrice);
    const originalPrice = formatCurrency(numericPrice);
    const productUrl = `/${urlString(name)}`;
    async function handleAddToCart() {
        "use server"
        await addToCart(id, undefined, 1);
    }

    return (
        <article className="group flex flex-col bg-[#1e232b] rounded-lg shadow-md transition-all
            duration-300 hover:shadow-lg hover:shadow-[#00CAFF]/20 hover:-translate-y-1 h-full">
            <Link
                href={productUrl}
                aria-label={`View product details for ${name}`}
                className="block relative w-full aspect-square overflow-hidden rounded-t-lg"
            >
                <Image
                    src={img || "/images/placeholder.png"}
                    alt={name}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.66vw"
                    className="transition-transform duration-300 group-hover:scale-105 p-2 sm:p-3"
                />

                {numericDiscount > 0 && (
                    <div className="absolute top-2 left-2 group-hover:top-1 group-hover:left-1 duration-300 bg-red-500 text-white text-xs
                        sm:text-sm font-bold px-2 py-1 rounded-md">
                        -{numericDiscount}%
                    </div>
                )}
            </Link>

            <div className="flex flex-col flex-grow p-2 sm:p-3">
                <Link href={productUrl} className="block mb-1 sm:mb-2">
                    <h3 className="font-semibold text-white line-clamp-2 transition-colors duration-200 group-hover:text-[#00CAFF] text-xs sm:text-base leading-tight">
                        {name}
                    </h3>
                </Link>
                <p className="text-gray-400 text-xs line-clamp-2 mb-2 sm:mb-3 flex-grow min-h-[2em] leading-relaxed">
                    {description}
                </p>

                <div className="mb-2 sm:mb-3">
                    <Stars rating={rating} url={`${productUrl}/reviews`} />
                </div>

                <div className="mt-auto space-y-1 sm:space-y-2">
                    {numericDiscount > 0 && (
                        <div className="text-gray-500 line-through text-xs">
                            {originalPrice}
                        </div>
                    )}

                    <div className="flex items-end justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-bold text-white text-sm sm:text-base lg:text-lg block truncate">
                                {formattedPrice}
                            </span>
                        </div>
                        <form action={handleAddToCart}>
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center bg-[#FCECDD] cursor-pointer text-black font-medium rounded-md
                            transition-all duration-200 hover:bg-[#f9d7b8] hover:scale-105 focus:outline-none focus:ring-2
                            focus:ring-[#f9d7b8] focus:ring-offset-1 focus:ring-offset-[#1e232b] active:scale-95 text-xs px-2 
                            py-1 flex-shrink-0 min-w-[50px] max-w-[90px]"
                            >
                                <b className="hidden 2xl:inline">Add to Cart</b>
                                <b className="inline 2xl:hidden">Add</b>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </article>
    );
}
