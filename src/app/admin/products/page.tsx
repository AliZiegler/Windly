import { db } from "@/lib/db"
import { eq, avg } from "drizzle-orm";
import { productTable, reviewTable } from "@/db/schema"
export default async function AdminProducts() {
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
        .groupBy(productTable.id);
    return (
        <h1>Products</h1>
    )
}
