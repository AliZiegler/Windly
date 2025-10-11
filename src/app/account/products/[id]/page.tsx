import { db } from "@/lib/db";
import { eq, avg, count } from "drizzle-orm";
import { productTable, reviewTable, cartItemTable, userTable } from "@/db/schema";
import { notFound } from "next/navigation";
import { SearchParamsType } from "@/app/components/global/Types";
import ProductView from "@/app/components/admin/products/ProductView";
import ProductEdit from "@/app/components/admin/products/ProductEdit";
import ReviewsSection from "@/app/components/admin/products/ReviewsSection";
import { auth } from "@/auth";
type ProductEditPageProps = {
    params: Promise<{ id: string; }>;
    searchParams: SearchParamsType;
}

export default async function ProductEditPage({ params, searchParams }: ProductEditPageProps) {
    const session = await auth();
    const userId = session?.user?.id
    const resolvedParams = await params;
    const sp = await searchParams;
    const productId = parseInt(resolvedParams.id);
    const mode = sp.mode || 'view';
    const isEditing = mode === 'edit';

    if (isNaN(productId) || !userId) {
        notFound();
    }
    const [user] = await db.select({ role: userTable.role }).from(userTable).where(eq(userTable.id, userId));

    if (user.role === "user") {
        notFound();
    }

    const [productData] = await db
        .select({
            id: productTable.id,
            name: productTable.name,
            description: productTable.description,
            price: productTable.price,
            discount: productTable.discount,
            img: productTable.img,
            imgAlt: productTable.imgAlt,
            category: productTable.category,
            brand: productTable.brand,
            stock: productTable.stock,
            weight: productTable.weight,
            dimensionsLength: productTable.dimensionsLength,
            dimensionsWidth: productTable.dimensionsWidth,
            dimensionsHeight: productTable.dimensionsHeight,
            colors: productTable.colors,
            sizes: productTable.sizes,
            tags: productTable.tags,
            sku: productTable.sku,
            featured: productTable.featured,
            shippingFreeShipping: productTable.shippingFreeShipping,
            shippingEstimatedDays: productTable.shippingEstimatedDays,
            shippingCost: productTable.shippingCost,
            warrantyDuration: productTable.warrantyDuration,
            warrantyType: productTable.warrantyType,
            about: productTable.about,
            dateAdded: productTable.dateAdded,
            lastUpdated: productTable.lastUpdated,
            avgRating: avg(reviewTable.rating),
            reviewCount: count(reviewTable.id),
        })
        .from(productTable)
        .leftJoin(reviewTable, eq(productTable.id, reviewTable.productId))
        .where(eq(productTable.id, productId))
        .groupBy(productTable.id);

    if (!productData) {
        notFound();
    }

    const [salesData] = await db
        .select({
            salesCount: count(cartItemTable.quantity)
        })
        .from(cartItemTable)
        .where(eq(cartItemTable.productId, productId));

    const product = {
        ...productData,
        avgRating: productData.avgRating ? Number(productData.avgRating) : null,
        dateAdded: new Date(productData.dateAdded),
        lastUpdated: new Date(productData.lastUpdated),
        salesCount: salesData?.salesCount || 0
    };

    return (
        <div className="flex flex-col gap-6">
            {isEditing ? (
                <ProductEdit product={product} sellerPage />
            ) : (
                <ProductView product={product} sellerPage />
            )}
            <ReviewsSection
                productName={product.name}
                searchParams={sp}
            />
        </div>
    );
}
