export function updateSearchParams(
    currentSearchParams: string | URLSearchParams,
    key: string,
    value: string | null | undefined,
): string {
    const params = new URLSearchParams(currentSearchParams);
    if (value === null || value === undefined || value === "") {
        params.delete(key);
    } else {
        params.set(key, value);
    }
    const order = [
        "search",
        "category",
        "price",
        "discount",
        "sort",
        "reverse",
    ];
    const sortedParams = new URLSearchParams();
    order.forEach((paramName) => {
        if (params.has(paramName)) {
            sortedParams.set(paramName, params.get(paramName)!);
        }
    });
    for (const [paramName, paramValue] of params.entries()) {
        if (!order.includes(paramName)) {
            sortedParams.set(paramName, paramValue);
        }
    }

    return sortedParams.toString();
}
export const ORIGINAL_MAX_PRICE = 12000;
export function spacesToDashes(str: string): string {
    return str.replace(/\s+/g, "-");
}
export function dashesToSpaces(str: string): string {
    return str.replace(/-/g, " ");
}
export function ampersandToAnd(str: string): string {
    return str.replace(/&/g, "and");
}
export function urlString(str: string): string {
    return str.replace(/\s+/g, "-").replace(/&/g, "and");
}
export function reverseUrlString(str: string): string {
    return str.replace(/-/g, " ").replace(/and/g, "&");
}
export function applyDiscount(price: number, discountPercentage: number): number {
    if (price < 0) {
        throw new Error("Price cannot be negative");
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
        throw new Error("Discount percentage must be between 0 and 100");
    }
    const discountAmount = (price * discountPercentage) / 100;
    return (price - discountAmount);
}
export function formatPrice(price: number): string {
    return price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
export function salePrice(price: number, discountPercentage: number): string {
    const salePrice = applyDiscount(price, discountPercentage);
    return formatPrice(salePrice);
}
export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export const CATEGORIES = [
    "All",
    "Arts & Craft",
    "Automotive",
    "Baby",
    "Beauty & Fashion",
    "Books",
    "Computers",
    "Electronics",
    "Home & Garden",
    "Kids",
    "Movies",
    "Music",
    "Sports",
    "Tools",
    "Toys",
    "Video Games",
    "Other",
];
export const iraqiProvinces = [
    "Anbar",
    "Babil",
    "Baghdad",
    "Basra",
    "Dhi Qar",
    "Diyala",
    "Duhok",
    "Erbil",
    "Halabja",
    "Karbala",
    "Kirkuk",
    "Maysan",
    "Muthanna",
    "Najaf",
    "Nineveh",
    "Qadisiyyah",
    "Salah Al-Din",
    "Sulaymaniyah",
    "Wasit"
];
