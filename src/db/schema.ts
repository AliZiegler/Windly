import { int, sqliteTable, text, real, integer, primaryKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccountType } from "next-auth/adapters"

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

    colors: text().notNull(), // array of color objects each has a colorName and colorHex

    sizes: text(), // JSON string of size array

    tags: text().notNull(), // an array of strings, that you gonna json it

    dateAdded: text().notNull(), // ISO date string
    lastUpdated: text().notNull(), // ISO date string

    featured: int().notNull().default(0),

    shippingFreeShipping: int().notNull().default(0),
    shippingEstimatedDays: int().notNull(),
    shippingCost: real().notNull(),

    warrantyDuration: int().notNull(), // in months
    warrantyType: text().notNull(),

    about: text().notNull(), // JSON string of about array around 5 points and each one considerably long
});


export const productIndexes = {
    categoryIndex: "CREATE INDEX IF NOT EXISTS idx_product_category ON product(category)",
    brandIndex: "CREATE INDEX IF NOT EXISTS idx_product_brand ON product(brand)",
    priceIndex: "CREATE INDEX IF NOT EXISTS idx_product_price ON product(price)",
    ratingIndex: "CREATE INDEX IF NOT EXISTS idx_product_rating ON product(rating)",
    stockIndex: "CREATE INDEX IF NOT EXISTS idx_product_stock ON product(stock)",
    featuredIndex: "CREATE INDEX IF NOT EXISTS idx_product_featured ON product(featured)",
    skuIndex: "CREATE INDEX IF NOT EXISTS idx_product_sku ON product(sku)",
};
export const userTable = sqliteTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
    image: text("image"),
})

export const accounts = sqliteTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    })
)

export const sessions = sqliteTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => userTable.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})

export const verificationTokenTable = sqliteTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    },
    (verificationToken) => ({
        compositePk: primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    })
)

export const authenticatorTable = sqliteTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => userTable.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: integer("credentialBackedUp", {
            mode: "boolean",
        }).notNull(),
        transports: text("transports"),
    },
    (authenticator) => ({
        compositePK: primaryKey({
            columns: [authenticator.userId, authenticator.credentialID],
        }),
    })
)
export type SelectProduct = typeof productTable.$inferSelect
