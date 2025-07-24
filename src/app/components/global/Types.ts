import { SelectProduct, SelectAddress } from "@/db/schema";
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
    dimensionsLength: number; // in cm
    dimensionsWidth: number; // in cm
    dimensionsHeight: number; // in cm
    colors: { colorName: string; colorHex: string }[]; // stored as JSON string in DB
    sizes?: string[]; // optional, stored as JSON string in DB
    tags: string[]; // stored as JSON string in DB
    dateAdded: string; // ISO string
    lastUpdated: string; // ISO string
    featured: 0 | 1;
    shippingFreeShipping: 0 | 1;
    shippingEstimatedDays: number;
    shippingCost: number;
    warrantyDuration: number; // in months
    warrantyType: string;
    about: string[]; // long descriptive points, stored as JSON string in DB
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
