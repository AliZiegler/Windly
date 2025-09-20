import { db } from "@/lib/db";
import { Suspense } from "react";
import { productTable, reviewTable } from "@/db/schema";
import { CATEGORIES } from "@/app/components/global/Atoms.ts";
import Product from "@/app/components/home/Product.tsx";
import { DisplayProduct } from "@/app/components/global/Types";
import { reverseUrlString } from "@/app/components/global/Atoms";
import { and, gte, lte, like, eq, inArray, not, avg } from "drizzle-orm";

type PageProps = {
    searchParams: Promise<{
        sort?: string;
        reverse?: string;
        discount?: string;
        rating?: string;
        minPrice?: string;
        maxPrice?: string;
        search?: string;
        category?: string;
    }>;
};

function sortProducts(products: DisplayProduct[], sort: string, reverse: boolean): DisplayProduct[] {
    const sortedProducts = [...products];
    switch (sort) {
        case "price":
            sortedProducts.sort((a, b) => {
                const priceA = a.price * (1 - a.discount / 100);
                const priceB = b.price * (1 - b.discount / 100);
                return reverse ? priceB - priceA : priceA - priceB;
            });
            break;
        case "discount":
            sortedProducts.sort((a, b) => {
                return reverse ? a.discount - b.discount : b.discount - a.discount;
            });
            break;
        case "rating":
            sortedProducts.sort((a, b) => {
                return reverse ? a.rating - b.rating : b.rating - a.rating;
            });
            break;
        case "relevance":
        default:
            sortedProducts.sort((a, b) => {
                return reverse ? b.id - a.id : a.id - b.id;
            });
            break;
    }
    return sortedProducts;
}

function EmptyProducts({ searchTerm }: { searchTerm?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 opacity-20">
                📦
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-3">
                No Products Found
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-sm sm:max-w-md md:max-w-lg leading-relaxed">
                {searchTerm
                    ? `We couldn't find any products matching "${searchTerm}". Try adjusting your filters or search terms.`
                    : "No products match your current filters. Try adjusting your search options."
                }
            </p>
        </div>
    );
}

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const sort = params.sort || "relevance";
    const reverse = params.reverse === "true";
    const minDiscount = Number(params.discount) || 0;
    const minRating = Number(params.rating) || 0;
    const maxPrice = Number(params.maxPrice) || 12000;
    const minPrice = Number(params.minPrice) || 0;
    const search = params.search || "";
    const category = params.category || "all";

    const conditions = [];
    if (maxPrice < 12000) {
        conditions.push(lte(productTable.price, maxPrice));
    }
    if (minPrice > 0) {
        conditions.push(gte(productTable.price, minPrice));
    }
    if (minDiscount > 0) {
        conditions.push(gte(productTable.discount, minDiscount));
    }
    if (search) {
        conditions.push(like(productTable.name, `%${search}%`));
    }
    if (category !== "all") {
        if (category === "other") {
            conditions.push(not(inArray(productTable.category, CATEGORIES)));
        } else {
            conditions.push(eq(productTable.category, reverseUrlString(category)));
        }
    }
    const productsWithRatings = await db
        .select({
            id: productTable.id,
            name: productTable.name,
            price: productTable.price,
            discount: productTable.discount,
            img: productTable.img,
            description: productTable.description,
            avgRating: avg(reviewTable.rating),
        })
        .from(productTable)
        .leftJoin(reviewTable, eq(productTable.id, reviewTable.productId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(productTable.id);

    let rawProducts: DisplayProduct[] = productsWithRatings.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        img: product.img,
        description: product.description,
        rating: product.avgRating ? Number(product.avgRating) : 0,
    }));

    if (minRating > 0) {
        rawProducts = rawProducts.filter(product => product.rating >= minRating);
    }

    const Products = sortProducts(rawProducts, sort, reverse);

    return (
        <div className="min-h-screen bg-[#222831]">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-white text-lg">Loading Products…</div>
                </div>
            }>
                {Products.length > 0 && (
                    <div className="sticky top-0 z-10 bg-[#222831]/95 backdrop-blur-sm border-b border-gray-700">
                        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <p className="text-gray-300 text-sm sm:text-base font-medium">
                                        <span className="text-white font-semibold">{Products.length}</span> products
                                    </p>
                                    {search && (
                                        <p className="text-gray-400 text-sm">
                                            for <span className="text-[#00CAFF] font-medium">&quot;{search}&quot;</span>
                                        </p>
                                    )}
                                </div>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    Sorted by <span className="capitalize">{sort}</span>
                                    {reverse && <span className="text-gray-400"> (reverse)</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <main>
                    <div className="px-4 sm:px-6 lg:px-8">
                        {Products.length > 0 ? (
                            <div className="py-6 sm:py-8 lg:py-10">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                                    {Products.map((product: DisplayProduct) => (
                                        <Product key={product.id} {...product} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <EmptyProducts searchTerm={search} />
                        )}
                    </div>
                </main>

                <div className="h-8 sm:h-12 lg:h-16"></div>
            </Suspense>
        </div>
    );
}
