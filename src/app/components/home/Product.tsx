import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/productDetails/AllRatings";
import { urlString, applyDiscount } from "@/app/components/global/Atoms.ts";
import { DisplayProduct } from "@/app/components/global/Types";

export default function Product({
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

    return (
        <div className="group flex flex-col bg-[#1e232b] w-48 lg:w-72 p-3 text-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <Link href={productUrl} aria-label={`View product details for ${name}`}>
                <div className="relative w-full aspect-square overflow-hidden rounded-md">
                    <Image
                        src={img || "/images/placeholder.png"}
                        alt={name}
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="(max-width: 768px) 192px, 288px"
                        className="transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>

            <div className="flex flex-col flex-grow mt-3">
                <Link href={productUrl}>
                    <h3 className="text-base font-semibold line-clamp-2 transition-colors duration-200 group-hover:text-[#00CAFF]">
                        {name}
                    </h3>
                </Link>

                <p className="text-sm text-gray-400 line-clamp-2 mt-1 min-h-[2rem]">
                    {description}
                </p>

                <div className="mt-2">
                    <Stars rating={rating} url={`${productUrl}/reviews`} />
                </div>

                <div className="mt-auto pt-2 flex flex-col gap-1">
                    {numericDiscount > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold text-sm">
                                -{numericDiscount}%
                            </span>
                            <span className="text-gray-500 line-through text-sm">
                                {originalPrice}
                            </span>
                        </div>
                    )}
                    <div className="flex items-end justify-between">
                        <span className="font-extrabold text-xl">
                            {formattedPrice}
                        </span>
                        <Link
                            href={productUrl}
                            className="bg-[#FCECDD] text-black font-bold py-1.5 px-3 text-xs rounded-full transition-colors 
                            duration-200 hover:bg-[#f9d7b8] focus:outline-none focus:ring-2 focus:ring-[#f9d7b8]"
                        >
                            Add to Cart
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
