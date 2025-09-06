import WriteReview from "@/app/components/productDetails/WriteReview";
import { db } from "@/lib/db";
import { parseProduct } from "@/lib/mappers";
import { getProductReviews } from "@/app/actions/ReviewActions";
import { productTable, reviewTable, wishlistTable, } from "@/db/schema";
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
import { DollarSign, ExternalLink } from "lucide-react";

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
        return redirect("/page/not-found");
    }
    const p = parseProduct(rawP[0])
    if (!p) return redirect("/");
    const rawReviews = await getProductReviews(productName)
    const averageRating = rawReviews?.reviews?.length
        ? rawReviews.reviews.reduce((acc, review) => acc + review.rating, 0) / rawReviews.reviews.length
        : 0
    const sp = await searchParams;

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
        <div className="min-h-screen bg-[#222831]">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 py-6 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12">

                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="sticky top-6">
                            <div className="relative group">
                                <div className="aspect-square w-full max-w-lg mx-auto lg:max-w-none bg-gray-800/50 rounded-2xl 
                                    overflow-hidden border border-gray-700/50 shadow-2xl">
                                    <Image
                                        src={p.img || "/images/placeholder.png"}
                                        alt={p.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                <div className="flex justify-center mt-4 space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 xl:col-span-5">
                        <article className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-100 leading-tight">
                                    {p.name}
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-300 font-medium leading-relaxed">
                                    {p.description}
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center text-[#00CAFF] hover:text-blue-300 transition-colors duration-200 font-medium"
                                >
                                    <span className="mr-1">Visit the</span>
                                    <span className="font-semibold">{p.brand}</span>
                                    <span className="ml-1">store</span>
                                    <ExternalLink className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-gray-100">{averageRating.toFixed(1)}</span>
                                    <AllReviews rating={averageRating} url={`/${name}/reviews`} size={28} prefetch />
                                </div>
                                {session && (
                                    <div className="flex items-center">
                                        <Heart
                                            productId={p.id}
                                            size={35}
                                            isWishlisted={isWishlisted}
                                            className="p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

                            {/* Pricing */}
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-baseline gap-3">
                                    <span className="text-4xl sm:text-5xl font-bold text-gray-100">
                                        {formattedPrice}
                                    </span>
                                    {p.discount > 0 && (
                                        <div className="flex flex-col">
                                            <span className="text-xl sm:text-2xl text-green-400 font-semibold">
                                                {p.discount}% OFF
                                            </span>
                                            <span className="text-sm right-7 text-gray-400 line-through">
                                                ${(p.price).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {p.discount > 0 && (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 border border-green-400/20">
                                        <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                                        <span className="text-green-300 font-medium text-sm">
                                            You save ${((p.price * p.discount) / 100).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Colors */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-200">Available Colors:</h3>
                                <ColorSelect colors={p.colors} searchParams={sp} />
                            </div>

                            {/* Product Properties */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-200">Product Details:</h3>
                                <div className="bg-[#1e232b] rounded-xl p-4 border border-gray-700/50">
                                    <PropsTable p={p} className="w-full" />
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

                            {/* About Section */}
                            <div className="space-y-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">About this item</h2>
                                <div className="bg-[#1e232b] rounded-xl p-6 border border-gray-700/30">
                                    <ul className="space-y-3 text-gray-300">
                                        {p.about.map((item: string) => (
                                            <li key={item} className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                                <span className="text-base leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="lg:col-span-3 xl:col-span-3">
                        <div className="sticky top-6">
                            <PurchaseBar
                                p={p}
                                searchParams={sp}
                                className="bg-gradient-to-br from-[#21272f] to-[#1a1f26] border border-[#373c43] rounded-2xl p-6 shadow-2xl space-y-4"
                                didReview={didUserReview}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 lg:mt-16">
                    <WriteReview
                        review={userReview}
                        searchParams={sp}
                        productId={p.id}
                        productName={p.name}
                        userId={userId || ""}
                    />
                </div>
            </div>
        </div>
    );
}
