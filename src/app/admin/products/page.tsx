import { db } from "@/lib/db";
import { eq, avg, count, sql, like, and, or, gte, lte, asc, desc } from "drizzle-orm";
import { productTable, reviewTable, cartItemTable } from "@/db/schema";
import Link from "next/link";
import { formatPrice, updateSearchParams } from "@/app/components/global/Atoms";
import FilterForm from "@/app/components/admin/products/FilterForm";
import {
    Edit, Star, Package, TrendingUp, PackageMinus,
    X
} from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { ResolvedSearchParamsType, SearchParamsType } from "@/app/components/global/Types";
import SummaryFilter from "@/app/components/global/SummaryFilter";
function normalizeParams(sp: ResolvedSearchParamsType) {
    const toStr = (val: string | string[] | undefined): string | undefined =>
        Array.isArray(val) ? val[0] : val;

    return {
        search: toStr(sp.search),
        category: toStr(sp.category),
        brand: toStr(sp.brand),
        featured: toStr(sp.featured),
        stockStatus: toStr(sp.stockStatus),
        rating: toStr(sp.rating),
        minPrice: toStr(sp.minPrice),
        maxPrice: toStr(sp.maxPrice),
    };
}

export default async function AdminProducts({
    searchParams
}: {
    searchParams: SearchParamsType
}) {
    const sp = await searchParams;
    const { search, category, brand, featured, stockStatus, minPrice, maxPrice, rating } =
        normalizeParams(sp);

    const buildWhereClause = () => {
        const conditions = [];

        if (search) {
            const searchTerm = `%${search}%`;
            conditions.push(
                or(
                    like(productTable.name, searchTerm),
                    like(productTable.sku, searchTerm),
                    like(productTable.description, searchTerm)
                )
            );
        }

        if (category) conditions.push(eq(productTable.category, category));
        if (brand) conditions.push(eq(productTable.brand, brand));
        if (featured) conditions.push(eq(productTable.featured, parseInt(featured)));
        if (rating) conditions.push(gte(reviewTable.rating, parseInt(rating)));

        if (stockStatus) {
            switch (stockStatus) {
                case "out":
                    conditions.push(eq(productTable.stock, 0));
                    break;
                case "very-low":
                    conditions.push(and(gte(productTable.stock, 1), lte(productTable.stock, 4)));
                    break;
                case "low":
                    conditions.push(and(gte(productTable.stock, 5), lte(productTable.stock, 9)));
                    break;
                case "in-stock":
                    conditions.push(and(gte(productTable.stock, 10), lte(productTable.stock, 49)));
                    break;
                case "well-stocked":
                    conditions.push(gte(productTable.stock, 50));
                    break;
            }
        }

        if (minPrice) conditions.push(gte(productTable.price, parseFloat(minPrice)));
        if (maxPrice) conditions.push(lte(productTable.price, parseFloat(maxPrice)));

        return conditions.length > 0 ? and(...conditions) : undefined;
    };

    const buildOrderClause = () => {
        const sortBy = sp.sortBy || 'dateAdded';
        const sortOrder = sp.sortOrder || 'desc';

        let column;
        switch (sortBy) {
            case 'name':
                column = productTable.name;
                break;
            case 'price':
                column = productTable.price;
                break;
            case 'stock':
                column = productTable.stock;
                break;
            case 'avgRating':
                column = avg(reviewTable.rating);
                break;
            case 'salesCount':
                column = sql<number>`COALESCE((
                    SELECT SUM(${cartItemTable.quantity}) 
                    FROM ${cartItemTable} 
                    WHERE ${cartItemTable.productId} = ${productTable.id}
                ), 0)`;
                break;
            default:
                column = productTable.dateAdded;
        }

        return sortOrder === 'asc' ? asc(column) : desc(column);
    };

    const productsWithStats = await db
        .select({
            id: productTable.id,
            name: productTable.name,
            price: productTable.price,
            discount: productTable.discount,
            img: productTable.img,
            imgAlt: productTable.imgAlt,
            description: productTable.description,
            category: productTable.category,
            brand: productTable.brand,
            stock: productTable.stock,
            featured: productTable.featured,
            sku: productTable.sku,
            dateAdded: productTable.dateAdded,
            avgRating: avg(reviewTable.rating),
            reviewCount: count(reviewTable.id),
            salesCount: sql<number>`COALESCE((
                SELECT SUM(${cartItemTable.quantity}) 
                FROM ${cartItemTable} 
                WHERE ${cartItemTable.productId} = ${productTable.id}
            ), 0)`
        })
        .from(productTable)
        .leftJoin(reviewTable, eq(productTable.id, reviewTable.productId))
        .leftJoin(cartItemTable, eq(productTable.id, cartItemTable.productId))
        .where(buildWhereClause())
        .groupBy(productTable.id)
        .orderBy(buildOrderClause());

    // Get all products for filter options (without filters applied)
    const allProducts = await db
        .select({
            category: productTable.category,
            brand: productTable.brand
        })
        .from(productTable)
        .groupBy(productTable.category, productTable.brand);

    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    const brands = [...new Set(allProducts.map(p => p.brand))].sort();

    const totalProducts = productsWithStats.length;
    const lowStockProducts = productsWithStats.filter(p => p.stock < 10).length;
    const featuredProducts = productsWithStats.filter(p => p.featured === 1).length;
    const totalSales = productsWithStats.reduce((sum, p) => sum + p.salesCount, 0);

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
        if (stock < 5) return { text: 'Very Low', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
        if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
        if (stock < 50) return { text: 'In Stock', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
        return { text: 'Well Stocked', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
    };

    const displayProducts = productsWithStats.map((product) => {
        const date = new Date(product.dateAdded);
        const formattedDate = date.toLocaleDateString("en-GB");
        const stockStatus = getStockStatus(product.stock);
        const finalPrice = product.price * (1 - product.discount / 100);
        const hasDiscount = product.discount > 0;

        return (
            <tr key={product.id} className="odd:bg-[#1c2129] even:bg-[#222831] hover:bg-[#2a3038] transition-colors duration-200">
                <td className="p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#2a3038] flex-shrink-0">
                            {product.img ? (
                                <Image
                                    src={product.img}
                                    alt={product.imgAlt || product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/admin/products/${product.id}`}
                                className="font-medium hover:text-[#00CAFF] duration-200 text-gray-200 truncate block">
                                {product.name}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-mono">#{product.sku}</span>
                                {product.featured === 1 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 
                                        rounded-full border border-yellow-500/30">
                                        <Star className="w-3 h-3" />
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="p-3 text-sm text-gray-300">
                    <div>
                        <Link href={`/admin/products?${updateSearchParams(sp, 'category', product.category)}`}
                            className="font-medium hover:text-[#00CAFF] duration-200">{product.category}</Link>
                    </div>
                    <div>
                        <Link href={`/admin/products?${updateSearchParams(sp, 'brand', product.brand)}`}
                            className="text-xs text-gray-400 hover:text-[#00CAFF] duration-200">{product.brand}</Link>
                    </div>
                </td>
                <td className="p-3 text-sm text-gray-300">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                        <span className={`font-semibold ${hasDiscount ? 'text-green-400' : ''}`}>
                            {formatPrice(finalPrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-xs text-red-400">
                                -{product.discount}% off
                            </span>
                        )}
                    </div>
                </td>
                <td className="p-3">
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                            {product.stock}
                        </span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium text-gray-200">
                                {product.avgRating ? Number(product.avgRating).toFixed(1) : 'N/A'}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">
                            ({product.reviewCount} reviews)
                        </span>
                    </div>
                </td>
                <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-200">
                            {product.salesCount}
                        </span>
                    </div>
                </td>
                <td className="p-3 text-xs text-gray-400 text-center">
                    {formattedDate}
                </td>
                <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                        <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors duration-200 group"
                            title="Edit Product"
                        >
                            <Edit className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                        </Link>
                    </div>
                </td>
            </tr>
        );
    });

    const theadElements = ['Product', 'Category', 'Price', 'Stock', 'Rating', 'Sales', 'Added', 'Action'];
    const leftAlignedHeaders = ['Product', 'Category', 'Price'];
    const displayTHeadElements = theadElements.map((element) => {
        const isTextLeft = leftAlignedHeaders.includes(element);
        return (
            <th key={element} className={`p-3 text-sm font-semibold text-gray-300 ${isTextLeft ? 'text-left' : 'text-center'}`}>
                {element}
            </th>
        )
    });

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">Product Management</h1>
                    <p className="text-gray-400">
                        Manage your product inventory and details
                        {totalProducts > 0 && (
                            <span className="ml-2">• {totalProducts} product{totalProducts !== 1 ? 's' : ''} found</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] hover:scale-[1.02] active:scale-[0.98] 
                        transition-all duration-200"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <Suspense fallback={<div className="h-20 bg-[#1e232b] rounded-xl animate-pulse" />}>
                <SummaryFilter>
                    <FilterForm categories={categories} brands={brands} searchParams={sp} />
                </SummaryFilter>
            </Suspense>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Products</p>
                            <p className="text-2xl font-bold text-white">{totalProducts}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Package className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Low Stock</p>
                            <p className="text-2xl font-bold text-yellow-400">{lowStockProducts}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <PackageMinus className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Featured</p>
                            <p className="text-2xl font-bold text-yellow-400">{featuredProducts}</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Star fill="currentColor" className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Sales</p>
                            <p className="text-2xl font-bold text-green-400">{totalSales}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#1e232b] rounded-xl border border-[#2a3038] overflow-hidden">
                <div className="p-4 border-b border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg text-white">
                            {Object.keys(sp).length > 0 ? 'Filtered Products' : 'All Products'}
                        </h2>
                        <span className="text-sm text-gray-400">
                            {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2129]">
                            <tr>
                                {displayTHeadElements}
                            </tr>
                        </thead>
                        <tbody>
                            {displayProducts}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                    {productsWithStats.map((product) => {
                        const date = new Date(product.dateAdded);
                        const formattedDate = date.toLocaleDateString('en-GB');
                        const stockStatus = getStockStatus(product.stock);
                        const finalPrice = product.price * (1 - product.discount / 100);
                        const hasDiscount = product.discount > 0;

                        return (
                            <div key={product.id} className="p-4 border-b border-[#2a3038] last:border-b-0">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#2a3038] flex-shrink-0">
                                        {product.img ? (
                                            <Image
                                                src={product.img}
                                                alt={product.imgAlt || product.name}
                                                width={64}
                                                height={64}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="font-medium text-gray-200 truncate hover:text-[#00CAFF] duration-200 block">
                                            {product.name}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400 font-mono">#{product.sku}</span>
                                            {product.featured === 1 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 
                                                    text-yellow-400 rounded-full border border-yellow-500/30 text-xs">
                                                    <Star className="w-3 h-3" />
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {product.category} • {product.brand}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                    <div>
                                        <span className="text-gray-400">Price:</span>
                                        <div className="flex flex-col">
                                            {hasDiscount && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                            <span className={`font-semibold ${hasDiscount ? 'text-green-400' : 'text-gray-200'}`}>
                                                {formatPrice(finalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Stock:</span>
                                        <div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                                {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Rating:</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-medium text-gray-200">
                                                {product.avgRating ? Number(product.avgRating).toFixed(1) : 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({product.reviewCount})
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Sales:</span>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4 text-blue-400" />
                                            <span className="font-medium text-gray-200">{product.salesCount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Added: {formattedDate}</span>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/products/${product.id}`}
                                            className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors duration-200"
                                        >
                                            <Edit className="w-5 h-5 text-yellow-400" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* No Products Found */}
            {productsWithStats.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e232b] rounded-xl border border-[#2a3038]">
                    <div className="text-4xl mb-4 opacity-50">📦</div>
                    <h2 className="font-bold text-xl mb-2 text-white">
                        {Object.keys(sp).length > 0 ? 'No Products Match Your Filters' : 'No Products Found'}
                    </h2>
                    <p className="text-gray-400 mb-4">
                        {Object.keys(sp).length > 0
                            ? 'Try adjusting your search criteria or clear the filters to see all products.'
                            : 'Get started by adding your first product.'
                        }
                    </p>
                    <div className="flex gap-3">
                        {Object.keys(sp).length > 0 && (
                            <Link
                                href="/admin/products"
                                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-500 
                                         text-white font-medium rounded-lg transition-all duration-200"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear Filters
                            </Link>
                        )}
                        <Link
                            href="/admin/products/new"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                            text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            {Object.keys(sp).length > 0 ? 'Add Product' : 'Add Your First Product'}
                        </Link>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            {totalProducts > 0 && (
                <div className="text-center text-sm text-gray-400 pb-4">
                    Showing {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                    {Object.keys(sp).length > 0 && ' matching your filters'}
                </div>
            )}
        </div>
    );
}
