export const runtime = 'edge';
import { db } from "@/lib/db";
import { productTable } from "@/db/schema";
import { CATEGORIES } from "@/app/components/global/Atoms.ts";
import Product from "@/app/components/home/Product.tsx";
import { DisplayProduct } from "@/app/components/global/Types";
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

    const conditions = [];

    if (maxPrice < 12000) {
        conditions.push(lte(productTable.price, maxPrice));
    }

    if (minDiscount > 0) {
        conditions.push(gte(productTable.discount, minDiscount));
    }

    if (minRating > 0) {
        conditions.push(gte(productTable.rating, minRating));
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

    let orderBy;
    switch (sort) {
        case "price":
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

    const Products = await db
        .select({
            id: productTable.id,
            name: productTable.name,
            price: productTable.price,
            discount: productTable.discount,
            img: productTable.img,
            description: productTable.description,
            rating: productTable.rating,
        })
        .from(productTable)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy);
    return (
        <main className="flex flex-wrap gap-5 m-7">
            {Products.map((product: DisplayProduct) => (
                <Product key={product.id} {...product} />
            ))}
        </main>
    );
}
