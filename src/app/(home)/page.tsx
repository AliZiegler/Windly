import Products, { ProductType, CATEGORIES } from "@/app/components/global/Products.ts";
import Product from "@/app/components/home/Product.tsx";

type PageProps = {
    searchParams: {
        sort?: string;
        reverse?: string;
        discount?: string;
        rating?: string;
        price?: string;
        search?: string;
        category?: string;
    };
};

export default async function Page({ searchParams }: PageProps) {
    const params = await searchParams;
    const sort = params.sort || "relevance";
    const reverse = params.reverse || "false";
    const minDiscount = Number(params.discount) || 0;
    const minRating = Number(params.rating) || 0;
    const maxPrice = Number(params.price) || 12000;
    const search = params.search || "";
    const category = params.category || "all";

    const sortProducts = (
        products: ProductType[],
        sortType: string,
    ): ProductType[] => {
        const sortedProducts = [...products];
        switch (sortType) {
            case "price":
                return sortedProducts.sort((a, b) => {
                    const priceA = a.price * (1 - a.discount / 100);
                    const priceB = b.price * (1 - b.discount / 100);
                    return priceA - priceB;
                });
            case "discount":
                return sortedProducts.sort((a, b) => b.discount - a.discount);
            case "rating":
                return sortedProducts.sort((a, b) => b.rating - a.rating);
            case "relevance":
            default:
                return sortedProducts;
        }
    };

    function rangeProducts(products: ProductType[]): ProductType[] {
        return products.filter((product) =>
            product.price <= maxPrice &&
            product.discount >= minDiscount &&
            product.rating >= minRating &&
            product.name.toLowerCase().includes(search.toLowerCase()) &&
            (category === "all" || product.category.toLowerCase() === category || (category === "other" && CATEGORIES.includes(product.category)))
        );
    }

    const sortedProducts = reverse === "true"
        ? sortProducts(Products, sort).reverse()
        : sortProducts(Products, sort);

    const finalProducts = rangeProducts(sortedProducts);

    return (
        <main className="flex flex-wrap gap-5 m-7">
            {finalProducts.map((product: ProductType) => (
                <Product key={product.id} {...product} />
            ))}
        </main>
    );
}
