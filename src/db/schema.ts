import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const productTable = sqliteTable("product", {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    description: text().notNull(),
    rating: real().notNull(),
    price: real().notNull(),
    category: text().notNull(),
    brand: text().notNull(),
    discount: real().notNull(),
    img: text(),
    imgAlt: text(),
    sku: text().notNull().unique(),
    stock: int().notNull(),
    weight: int().notNull(),

    dimensionsLength: real().notNull(), // in cm
    dimensionsWidth: real().notNull(), // in cm
    dimensionsHeight: real().notNull(), // in cm

    colors: text().notNull(), // JSON string of color objects

    sizes: text(), // JSON string of size array

    tags: text().notNull(), // JSON string of tags array

    dateAdded: text().notNull(), // ISO date string
    lastUpdated: text().notNull(), // ISO date string

    featured: int().notNull().default(0), // 0 = false, 1 = true

    shippingFreeShipping: int().notNull().default(0), // 0 = false, 1 = true
    shippingEstimatedDays: int().notNull(),
    shippingCost: real().notNull(),

    warrantyDuration: int().notNull(), // in months
    warrantyType: text().notNull(),

    about: text().notNull(), // JSON string of about array
});


// Indexes for better query performance
export const productIndexes = {
    categoryIndex: "CREATE INDEX IF NOT EXISTS idx_product_category ON product(category)",
    brandIndex: "CREATE INDEX IF NOT EXISTS idx_product_brand ON product(brand)",
    priceIndex: "CREATE INDEX IF NOT EXISTS idx_product_price ON product(price)",
    ratingIndex: "CREATE INDEX IF NOT EXISTS idx_product_rating ON product(rating)",
    stockIndex: "CREATE INDEX IF NOT EXISTS idx_product_stock ON product(stock)",
    featuredIndex: "CREATE INDEX IF NOT EXISTS idx_product_featured ON product(featured)",
    skuIndex: "CREATE INDEX IF NOT EXISTS idx_product_sku ON product(sku)",
};
