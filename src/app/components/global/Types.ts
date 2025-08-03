import { SelectProduct } from "@/db/schema";
export type ProductType = {
    id: number;
    name: string;
    description: string;
    rating: number;
    price: number;
    category: string;
    brand: string;
    discount: number;
    img: string | null | undefined;
    imgAlt: string | null | undefined;
    sku: string;
    stock: number;
    weight: number; // in grams
    dimensions: {
        length: number; // in cm
        width: number; // in cm
        height: number; // in cm
    };
    colors: { colorName: string; colorHex: string }[];
    sizes?: string[];
    tags: string[];
    dateAdded: Date;
    lastUpdated: Date;
    featured: boolean;
    shipping: {
        freeShipping: boolean;
        estimatedDays: number;
        cost: number;
    };
    warranty: {
        duration: number;
        type: string;
    };
    about: string[];
};
export type searchParamsType = Promise<
    Record<string, string | string[] | undefined>
>;
export type SessionType = {
    user: {
        name: string;
        email: string;
        image: string;
    };
    expires: string;
};
export type DisplayProduct = Pick<SelectProduct, 'id' | 'name' | 'price' | 'discount' | 'img' | 'description' | 'rating'>
export type UpdateAddress = {
    name: string;
    country: string;
    phone: string;
    state: string;
    city: string;
    street: string;
    buildingNumber: string;
    zipCode: string;
    addressType: "home" | "office";
};
export type UpdateReview = {
    rating: number;
    review: string;
}
