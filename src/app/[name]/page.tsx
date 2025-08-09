import WriteReview from "@/app/components/productDetails/WriteReview";
import { db } from "@/lib/db";
import { parseProduct } from "@/lib/mappers";
import { getProductReviews } from "@/app/actions/UserActions";
import { productTable, reviewTable, wishlistTable } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { salePrice } from "@/app/components/global/Atoms";
import ColorSelect from "@/app/components/productDetails/ColorSelect";
import PropsTable from "@/app/components/productDetails/PropsTable";
import PurchaseBar from "@/app/components/productDetails/PurchaseBar";
import AllReviews from "@/app/components/productDetails/AllRatings";
import Heart from "@/app/components/global/Heart";

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
    const rawP = await db.select().from(productTable).where(eq(productTable.name, productName)).limit(1);
    if (!rawP || rawP.length === 0) {
        console.log(`Product not found: "${productName}"`);
        return redirect("/");
    }
    const p = parseProduct(rawP[0])
    if (!p) return redirect("/");
    const rawReviews = await getProductReviews(productName)
    const averageRating = rawReviews?.reviews?.length
        ? rawReviews.reviews.reduce((acc, review) => acc + review.rating, 0) / rawReviews.reviews.length
        : 0
    const sp = await searchParams;

    const aboutList = p.about.map((item: string) => <li key={item}>{item}</li>);
    const formattedPrice = salePrice(p.price, p.discount);
    const session = await auth();
    let isWishlisted = false;

    if (session?.user?.id) {
        const wishlistItem = await db
            .select()
            .from(wishlistTable)
            .where(
                and(
                    eq(wishlistTable.userId, session.user.id),
                    eq(wishlistTable.productId, p.id)
                )
            )
            .limit(1);

        isWishlisted = wishlistItem.length > 0;
    }

    const userId = session?.user?.id;

    let userReview = null;
    if (userId) {
        userReview = await db.select({
            id: reviewTable.id,
            rating: reviewTable.rating,
            review: reviewTable.review,
            createdAt: reviewTable.createdAt,
            updatedAt: reviewTable.updatedAt
        }).from(reviewTable).where(and(eq(reviewTable.productId, p.id), eq(reviewTable.userId, userId))).then((review) => review[0]);
    }
    const didUserReview = userReview !== null;

    return (
        <div className="flex flex-col gap-5 px-4 lg:px-16 xl:px-32">
            <div className="flex flex-col lg:flex-row mt-10 lg:mt-20 gap-8 lg:gap-3 items-center lg:items-start">
                {/* Product Image Section */}
                <div className="mx-auto lg:mx-0">
                    <Image
                        src="/images/placeholder.png"
                        alt="Placeholder"
                        height={450}
                        width={450}
                        className="hidden lg:block h-auto w-auto max-w-full"
                    />
                    <Image
                        src="/images/placeholder.png"
                        alt="Placeholder"
                        height={300}
                        width={300}
                        className="block lg:hidden h-auto w-auto max-w-full"
                    />
                </div>

                {/* Product Details Section */}
                <article className="flex flex-col gap-4 w-full lg:w-auto">
                    <h1 className="text-4xl sm:text-5xl">{p.name}</h1>
                    <b className="text-lg sm:text-xl block">{p.description}</b>
                    <Link href="/" className="text-[#00CAFF] hover:underline">
                        Visit the {p.brand} store
                    </Link>

                    <span className="flex items-center gap-1">
                        <b className="mt-1.5">{averageRating}</b>
                        <AllReviews rating={averageRating} url={`/${name}/reviews`} />
                        {session && <Heart productId={p.id} size={25} isWishlisted={isWishlisted} className="ml-2 mt-0.5" />}
                    </span>

                    <hr />

                    <div className="flex flex-wrap items-center">
                        <h1 className="text-3xl sm:text-4xl inline-block">
                            {p.discount > 0 ? formattedPrice + "," : formattedPrice}
                        </h1>
                        {p.discount > 0 && (
                            <span className="text-green-400 ml-1.5 mt-1 sm:mt-2.5 text-xl sm:text-2xl">
                                a save of {p.discount}%
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-neutral-300">Colors:</h2>
                        <ColorSelect colors={p.colors} searchParams={sp} />
                    </div>

                    <PropsTable p={p} className="mt-3" />

                    <hr />

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">About this item:</h1>
                        <ul className="list-disc list-inside flex flex-col gap-1 mt-3 text-lg">
                            {aboutList}
                        </ul>
                    </div>
                </article>

                {/* Purchase Bar Section */}
                <PurchaseBar
                    p={p}
                    searchParams={sp}
                    className="w-full lg:w-72 mt-8 lg:mt-0 bg-[#21272f] border-2 border-[#373c43] rounded-2xl p-5 flex flex-col gap-4 mx-auto lg:mx-0"
                    didReview={didUserReview}
                />
            </div>
            <WriteReview review={userReview} searchParams={sp} productId={p.id} productName={p.name} userId={userId || ""} />
        </div>
    );
}
