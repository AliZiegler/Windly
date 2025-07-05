export const runtime = 'edge';
import { db } from "@/lib/db";
import { mapRowToProduct } from "@/lib/mappers";
import { productTable } from "@/db/schema";
import { CATEGORIES, ProductType } from "@/app/components/global/Products.ts";
import Product from "@/app/components/home/Product.tsx";
import { reverseUrlString } from "@/app/components/global/Atoms";
import { and, gte, lte, like, eq, inArray, not, sql } from "drizzle-orm";

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

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const sort = params.sort || "relevance";
    const reverse = params.reverse || "false";
    const minDiscount = Number(params.discount) || 0;
    const minRating = Number(params.rating) || 0;
    const maxPrice = Number(params.price) || 12000;
    const search = params.search || "";
    const category = params.category || "all";

    // Build WHERE conditions
    const conditions = [];

    // Price filter
    if (maxPrice < 12000) {
        conditions.push(lte(productTable.price, maxPrice));
    }

    // Discount filter
    if (minDiscount > 0) {
        conditions.push(gte(productTable.discount, minDiscount));
    }

    // Rating filter
    if (minRating > 0) {
        conditions.push(gte(productTable.rating, minRating));
    }

    // Search filter
    if (search) {
        conditions.push(like(productTable.name, `%${search}%`));
    }

    // Category filter
    if (category !== "all") {
        if (category === "other") {
            // Products NOT in the predefined categories
            conditions.push(not(inArray(productTable.category, CATEGORIES)));
        } else {
            conditions.push(eq(productTable.category, reverseUrlString(category)));
        }
    }

    // Build ORDER BY clause
    let orderBy;
    switch (sort) {
        case "price":
            // Sort by discounted price: price * (1 - discount/100)
            orderBy = reverse === "true"
                ? sql`${productTable.price} * (1 - ${productTable.discount} / 100) DESC`
                : sql`${productTable.price} * (1 - ${productTable.discount} / 100) ASC`;
            break;
        case "discount":
            orderBy = reverse === "true"
                ? sql`${productTable.discount} ASC`
                : sql`${productTable.discount} DESC`;
            break;
        case "rating":
            orderBy = reverse === "true"
                ? sql`${productTable.rating} ASC`
                : sql`${productTable.rating} DESC`;
            break;
        case "relevance":
        default:
            orderBy = reverse === "true"
                ? sql`${productTable.id} DESC`
                : sql`${productTable.id} ASC`;
            break;
    }

    // Execute the optimized query
    const rawProducts = await db
        .select()
        .from(productTable)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy);
    const Products = rawProducts.map(mapRowToProduct);

    return (
        <main className="flex flex-wrap gap-5 m-7">
            {Products.map((product: ProductType) => (
                <Product key={product.id} {...product} />
            ))}
        </main>
    );
}
