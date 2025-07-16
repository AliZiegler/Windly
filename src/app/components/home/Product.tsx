import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/global/ReactStars.tsx";
import { urlString, applyDiscount } from "@/app/components/global/Atoms.ts";
import { DisplayProduct } from "@/app/components/global/Types";

export default function Product(props: DisplayProduct) {

    const price = Number(props.price);
    const discount = Number(props.discount);
    const finalePrice = applyDiscount(price, discount);
    const formattedPrice = finalePrice.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });



    const dashedName = urlString(props.name);
    const productUrl = `/${dashedName}`;

    return (
        <div className="bg-[#1e232b] w-[300px] h-auto max-h-[700px]  flex flex-wrap flex-col gap-3 pl-6 py-6 pr-2">
            <Link href={productUrl}>
                <Image
                    src={props.img || "/images/placeholder.png"}
                    alt={props.name}
                    width={254}
                    height={254}
                    className="text-center overflow-hidden cursor-pointer"
                />
            </Link>

            <Link
                href={productUrl}
                className="font-extrabold text-2xl my-2 hover:text-[#00CAFF] duration-200 cursor-pointer"
            >
                {props.name}
            </Link>

            <p className="self-center font-bold hover:text-[#00CAFF] duration-200 cursor-pointer">
                {props.description}
            </p>
            <Stars value={props.rating} size={35} edit={false} />

            <span>
                <Link
                    href={productUrl}
                    className="font-extralight text-3xl my-2 duration-200 inline cursor-pointer"
                >
                    <span className="hover:text-[#00CAFF]">
                        {formattedPrice}
                    </span>
                    {props.discount > 0 && ","}
                </Link>
                {props.discount > 0 && (
                    <b className="text-green-400 inline ml-1">
                        a save of {discount}%!
                    </b>
                )}
            </span>

            <Link
                href={productUrl}
                className="bg-[#FCECDD] text-black font-bold py-1 px-1 text-nowrap
                text-center rounded w-28 hover:bg-[#f9d7b8] transition-all duration-200 cursor-pointer block"
            >
                Add to Cart
            </Link>
        </div>
    );
}
