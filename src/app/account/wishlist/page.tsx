import { auth } from "@/auth";
import { db } from "@/lib/db";
import { productTable, wishlistTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { urlString } from "@/app/components/global/Atoms";
import Image from "next/image";
import Link from "next/link";
import Heart from "@/app/components/global/Heart";

export default async function Page() {
    const session = await auth();
    if (!session?.user?.id) {
        return <div>Need to Sign in</div>;
    }

    const wishlistItems = await db
        .select({
            productId: wishlistTable.productId,
            productName: productTable.name,
        })
        .from(wishlistTable)
        .innerJoin(productTable, eq(wishlistTable.productId, productTable.id))
        .where(eq(wishlistTable.userId, session.user.id));

    if (wishlistItems.length === 0) {
        return (
            <div>
                <h1 className="font-bold text-xl">My Wishlist</h1>
                <p className="mt-4 text-gray-400">Your wishlist is empty</p>
            </div>
        );
    }


    const DisplayProducts = wishlistItems.map((item) => (
        <div key={item.productId} className="w-[350px] max-h-[450px] h-auto bg-[#2d3440] border-1 border-gray-400 rounded-xl my-2 p-7">
            <span className="flex flex-col items-end mb-10">
                <Heart productId={item.productId} isWishlisted={true} size={22} />
                <Link href={`/${urlString(item.productName)}`} className="self-center" >
                    <Image src="/images/placeholder.png" alt={item.productName} width={250} height={250} />
                </Link>
            </span>
            <Link href={`/${urlString(item.productName)}`} className="text-xl font-light hover:text-[#00CAFF] duration-200">{item.productName}</Link>
        </div>
    ));

    return (
        <div>
            <h1 className="font-bold text-xl">My Wishlist</h1>
            <div className="flex gap-10 flex-wrap">
                {DisplayProducts}
            </div>
        </div>
    );
}
