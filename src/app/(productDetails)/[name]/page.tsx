export const runtime = "edge"
import data, { ProductType } from "@/app/components/global/Products";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/global/ReactStars";
import { salePrice } from "@/app/components/global/Atoms";
import ColorSelect from "@/app/components/productDetails/ColorSelect";
import PropsTable from "@/app/components/productDetails/PropsTable";
import PurchaseBar from "@/app/components/productDetails/PurchaseBar";

export default async function Page(
    {
        params,
        searchParams,
    }: {
        params: Promise<{ name: string }>;
        searchParams: Promise<Record<string, string | string[] | undefined>>;
    }
) {
    const { name } = await params;
    const productName = name.replace(/-/g, " ");

    const p: ProductType | undefined = data.find((prod) => prod.name === productName);
    if (!p) return redirect("/");
    const spRecord = await searchParams;
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(spRecord)) {
        if (Array.isArray(value)) {
            value.forEach((v) => sp.append(key, v));
        } else if (value != null) {
            sp.append(key, value);
        }
    }

    const aboutList = p.about.map((item) => <li key={item}>{item}</li>);
    const formattedPrice = salePrice(p.price, p.discount);

    return (
        <div className="flex mt-20 gap-3">
            <Image
                src="/images/placeholder.png"
                alt="Placeholder"
                height={450}
                width={450}
                className="ml-32 mr-10 h-[460px] w-auto max-w-[460px]"
            />

            <article className="flex flex-col gap-4">
                <h1 className="text-5xl">{p.name}</h1>
                <b className="text-xl block">{p.description}</b>
                <Link href="/" className="text-[#00CAFF] hover:underline">
                    Visit the {p.brand} store
                </Link>

                <span className="flex items-center gap-1">
                    <b className="mt-1.5">{p.rating}</b>
                    <Stars value={p.rating} size={25} edit={false} />
                </span>

                <hr />

                <div className="flex">
                    <h1 className="text-4xl inline-block">
                        {p.discount > 0 ? formattedPrice + "," : formattedPrice}
                    </h1>
                    {p.discount > 0 && (
                        <span className="text-green-400 inline ml-1.5 mt-2.5 text-2xl">
                            a save of {p.discount}%
                        </span>
                    )}
                </div>

                <div className="flex flex-col">
                    <h2 className="text-neutral-300">Colors:</h2>
                    <ColorSelect product={p} searchParams={sp} />
                </div>

                <PropsTable p={p} className="mt-3" />

                <hr />

                <div>
                    <h1 className="text-3xl font-bold">About this item:</h1>
                    <ul className="list-disc list-inside flex flex-col gap-1 mt-3 text-lg">
                        {aboutList}
                    </ul>
                </div>
            </article>

            <PurchaseBar
                p={p}
                className="ml-10 w-72 h-[730px] bg-[#21272f] border-2 border-[#373c43] rounded-2xl pl-5 pt-4 flex flex-col gap-4"
            />
        </div>
    );
}
