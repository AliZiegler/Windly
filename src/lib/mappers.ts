import { SelectProduct } from "@/db/schema";
import { ProductType } from "@/app/components/global/Types";
export function parseProduct(product: SelectProduct): ProductType {
    try {
        if (!product) {
            throw new Error('Product is undefined or null');
        }

        if (!product.id) {
            console.error('Product missing id:', product);
            throw new Error('Product missing required id field');
        }
        const parsedProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            rating: product.rating,
            price: product.price,
            category: product.category,
            brand: product.brand,
            discount: product.discount,
            img: product.img,
            imgAlt: product.imgAlt,
            sku: product.sku,
            stock: product.stock,
            weight: product.weight,
            dimensions: {
                length: product.dimensionsLength,
                width: product.dimensionsWidth,
                height: product.dimensionsHeight
            },
            colors: JSON.parse(product.colors) as { colorName: string; colorHex: string }[],
            sizes: product.sizes ? JSON.parse(product.sizes) as string[] : undefined,
            tags: JSON.parse(product.tags) as string[],
            dateAdded: new Date(product.dateAdded),
            lastUpdated: new Date(product.lastUpdated),
            featured: Boolean(product.featured),
            shipping: {
                freeShipping: Boolean(product.shippingFreeShipping),
                estimatedDays: product.shippingEstimatedDays,
                cost: product.shippingCost
            },
            warranty: {
                duration: product.warrantyDuration,
                type: product.warrantyType
            },
            about: JSON.parse(product.about) as string[]
        };

        return parsedProduct;
    }
    catch (error) {
        console.error('Error parsing product:', error);
        console.error('Product data:', product);
        throw error;
    }
}
