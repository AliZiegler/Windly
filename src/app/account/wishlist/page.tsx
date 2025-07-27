import { auth } from "@/auth";
import { db } from "@/lib/db";
import { userTable, productTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { urlString } from "@/app/components/global/Atoms";
import Image from "next/image";
import Link from "next/link";
import Heart from "@/app/components/global/Heart";
export default async function Page() {
    const session = await auth();
    if (!session?.user?.id) {
        return <div>Need to Sign in</div>;
    }
    const row = await db.select({ wishlist: userTable.wishlist }).from(userTable).where(eq(userTable.id, session.user.id)).then((user) => user[0]);
    if (!row?.wishlist) {
        throw new Error("Sorry, We couldn't fetch your wishlist");
    }
    const wishlist = JSON.parse(row.wishlist);
    const products = await db
        .select({ name: productTable.name, id: productTable.id })
        .from(productTable)
        .where(inArray(productTable.id, wishlist));
    const DisplayProducts = products.map((product) => (
        <div key={product.id} className="w-[350px] max-h-[450px] h-auto bg-[#2d3440] border-1 border-gray-400 rounded-xl my-2 p-7">
            <span className="flex flex-col items-end mb-10">
                <Heart productId={product.id} isWishlisted={wishlist.includes(product.id)} size={20} />
                <Link href={`/${urlString(product.name)}`} className="self-center" >
                    <Image src="/images/placeholder.png" alt={product.name} width={250} height={250} />
                </Link>
            </span>
            <Link href={`/${urlString(product.name)}`} className="text-xl font-light">{product.name}</Link>
        </div>
    ))
    return (
        <div>
            <h1 className="font-bold text-xl">My Wishlist</h1>
            <div className="flex gap-10 flex-wrap">
                {...DisplayProducts}
            </div>
        </div>
    );
}
