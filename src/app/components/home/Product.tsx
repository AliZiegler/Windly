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
        <div className="group flex flex-col bg-[#1e232b] 
                        w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 2xl:w-80
                        p-2 sm:p-3 md:p-4 lg:p-3 xl:p-4
                        text-white rounded-lg shadow-md 
                        transition-all duration-300 hover:shadow-lg hover:shadow-[#00CAFF]/20">
            <Link href={productUrl} aria-label={`View product details for ${name}`}>
                <div className="relative w-full aspect-square overflow-hidden rounded-md">
                    <Image
                        src={img || "/images/placeholder.png"}
                        alt={name}
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, (max-width: 1280px) 256px, (max-width: 1536px) 288px, 320px"
                        className="transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>

            <div className="flex flex-col flex-grow mt-2 sm:mt-3">
                <Link href={productUrl}>
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg 
                                   font-semibold line-clamp-2 
                                   transition-colors duration-200 group-hover:text-[#00CAFF]">
                        {name}
                    </h3>
                </Link>

                <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base
                              text-gray-400 line-clamp-2 mt-1 
                              min-h-[1.5rem] sm:min-h-[2rem] md:min-h-[2.5rem] lg:min-h-[2rem] xl:min-h-[2.5rem]">
                    {description}
                </p>

                <div className="mt-1 sm:mt-2">
                    <Stars rating={rating} url={`${productUrl}/reviews`} />
                </div>

                <div className="mt-auto pt-2 flex flex-col gap-1">
                    {numericDiscount > 0 && (
                        <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-red-500 font-bold 
                                           text-xs sm:text-sm md:text-base lg:text-sm">
                                -{numericDiscount}%
                            </span>
                            <span className="text-gray-500 line-through 
                                           text-xs sm:text-sm md:text-base lg:text-sm">
                                {originalPrice}
                            </span>
                        </div>
                    )}

                    <div className="flex items-end justify-between gap-2">
                        <span className="font-extrabold 
                                       text-sm sm:text-base md:text-lg lg:text-base xl:text-xl 2xl:text-2xl">
                            {formattedPrice}
                        </span>

                        <Link
                            href={productUrl}
                            className="flex items-center justify-center bg-[#FCECDD] text-black font-bold 
                                     w-[60px] h-[20px] text-[10px]
                                     sm:w-[70px] sm:h-[22px] sm:text-xs
                                     md:w-[80px] md:h-[25px] md:text-sm
                                     lg:w-[75px] lg:h-[24px] lg:text-xs
                                     xl:w-[85px] xl:h-[28px] xl:text-sm
                                     2xl:w-[120px] 2xl:h-[30px] 2xl:text-base
                                     rounded-full transition-all duration-200 
                                     hover:bg-[#f9d7b8] hover:scale-105
                                     focus:outline-none focus:ring-2 focus:ring-[#f9d7b8] focus:ring-offset-1 focus:ring-offset-[#1e232b]
                                     active:scale-95">
                            <b>Add to Cart</b>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
