import { db } from "@/lib/db";
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
        <main className="flex flex-wrap gap-5 m-7">
            {Products.map((product: DisplayProduct) => (
                <Product key={product.id} {...product} />
            ))}
        </main>
    );
}
