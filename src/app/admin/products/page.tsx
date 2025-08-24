import { db } from "@/lib/db";
import { eq, avg, count, sql } from "drizzle-orm";
import { productTable, reviewTable, cartItemTable } from "@/db/schema";
import Link from "next/link";
import { formatPrice } from "@/app/components/global/Atoms";
import { Edit, Star, Package, TrendingUp, PackageMinus } from "lucide-react";
import Image from "next/image";

export default async function AdminProducts() {
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
        .groupBy(productTable.id)
        .orderBy(sql`${productTable.dateAdded} DESC`);

    const totalProducts = productsWithStats.length;
    const lowStockProducts = productsWithStats.filter(p => p.stock < 10).length;
    const featuredProducts = productsWithStats.filter(p => p.featured === 1).length;

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
        if (stock < 5) return { text: 'Very Low', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
        if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
        if (stock < 50) return { text: 'In Stock', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
        return { text: 'Well Stocked', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
    };

    const displayProducts = productsWithStats.map((product) => {
        const date = new Date(product.dateAdded);
        const formattedDate = date.toLocaleDateString();
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
                            <div className="font-medium text-gray-200 truncate">
                                {product.name}
                            </div>
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
                    <div className="font-medium">{product.category}</div>
                    <div className="text-xs text-gray-400">{product.brand}</div>
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
            <th key={element} className={`p-3 text-sm font-semibold text-gray-300 ${isTextLeft ? 'text-left' : 'text-center'}`}>{element}</th>
        )
    })

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl lg:text-3xl text-white mb-2">Product Management</h1>
                    <p className="text-gray-400">Manage your product inventory and details</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Add Product
                    </Link>
                </div>
            </div>

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
                            <p className="text-2xl font-bold text-green-400">
                                {productsWithStats.reduce((sum, p) => sum + p.salesCount, 0)}
                            </p>
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
                        <h2 className="font-semibold text-lg text-white">All Products</h2>
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
                        const formattedDate = date.toLocaleDateString();
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
                                        <h3 className="font-medium text-gray-200 truncate">{product.name}</h3>
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

            {productsWithStats.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="text-4xl mb-4 opacity-50">📦</div>
                    <h2 className="font-bold text-xl mb-2 text-white">No Products Found</h2>
                    <p className="text-gray-400 mb-4">Get started by adding your first product.</p>
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-xl hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                    >
                        <Package className="w-5 h-5 mr-2" />
                        Add Your First Product
                    </Link>
                </div>
            )}
        </div>
    );
}
