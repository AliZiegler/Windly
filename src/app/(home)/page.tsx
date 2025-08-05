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
        price?: string;
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
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
            <div className="text-6xl sm:text-7xl md:text-8xl mb-4 opacity-20">📦</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                No Products Found
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md">
                {searchTerm
                    ? `We couldn't find any products matching "${searchTerm}". Try adjusting your filters or search terms.`
                    : "No products match your current filters. Try adjusting your search criteria."
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
    const maxPrice = Number(params.price) || 12000;
    const search = params.search || "";
    const category = params.category || "all";

    const conditions = [];
    if (maxPrice < 12000) {
        conditions.push(lte(productTable.price, maxPrice));
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
        <Suspense fallback={<div>Loading Products…</div>}>
            <main className="min-h-screen">
                {Products.length > 0 && (
                    <div className="px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-2 sm:py-3 border-b border-[#2a3038]">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <p className="text-gray-400 text-sm sm:text-base">
                                Showing <span className="text-white font-semibold">{Products.length}</span> products
                                {search && (
                                    <span> for &quot;<span className="text-[#00CAFF]">{search}</span>&quot;</span>
                                )}
                            </p>
                            <p className="text-gray-500 text-xs sm:text-sm">
                                Sorted by {sort} {reverse && "(reverse)"}
                            </p>
                        </div>
                    </div>
                )}

                {Products.length > 0 ? (
                    <main className="flex flex-wrap justify-center sm:justify-start  gap-8 my-7 ml-5 min-[831px]:ml-20 mr-3">
                        {Products.map((product: DisplayProduct) => (
                            <Product key={product.id} {...product} />
                        ))}
                    </main>
                ) : (
                    <EmptyProducts searchTerm={search} />
                )}

                <div className="h-8 sm:h-12 md:h-16"></div>
            </main>
        </Suspense>
    );
}
