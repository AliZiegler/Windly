import type { InferSelectModel } from "drizzle-orm";
import { productTable } from "../db/schema";
import { ProductType } from "../app/components/global/Types";

type RawProductRow = InferSelectModel<typeof productTable>;

export function mapRowToProduct(row: RawProductRow): ProductType {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        rating: row.rating,
        price: row.price,
        category: row.category,
        brand: row.brand,
        discount: row.discount,

        img: row.img ?? undefined,
        imgAlt: row.imgAlt ?? undefined,

        sku: row.sku,
        stock: row.stock,
        weight: row.weight,
        dimensionsLength: row.dimensionsLength,
        dimensionsWidth: row.dimensionsWidth,
        dimensionsHeight: row.dimensionsHeight,

        colors: JSON.parse(row.colors),
        sizes: row.sizes ? JSON.parse(row.sizes) : undefined,
        tags: JSON.parse(row.tags),

        dateAdded: row.dateAdded,
        lastUpdated: row.lastUpdated,

        featured: row.featured as 0 | 1,
        shippingFreeShipping: row.shippingFreeShipping as 0 | 1,
        shippingEstimatedDays: row.shippingEstimatedDays,
        shippingCost: row.shippingCost,

        warrantyDuration: row.warrantyDuration,
        warrantyType: row.warrantyType,

        about: JSON.parse(row.about),
    };
}
type ProductDisplayRow = {
    id: number;
    name: string;
    price: number;
    discount: number;
    img: string | null;
    description: string;
    rating: number;
};

export function mapRowToProductDisplay(row: ProductDisplayRow): Pick<ProductType, 'id' | 'name' | 'price' | 'discount' | 'img' | 'description' | 'rating'> {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        rating: row.rating,
        price: row.price,
        discount: row.discount,
        img: row.img ?? undefined,
    };
}
