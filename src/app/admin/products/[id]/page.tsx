import { db } from "@/lib/db";
import { eq, avg, count } from "drizzle-orm";
import { productTable, reviewTable, cartItemTable } from "@/db/schema";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SearchParamsType } from "@/app/components/global/Types";
import { ArrowLeft, Save, Star, Package, TrendingUp, Eye, Edit3 } from "lucide-react";
import Image from "next/image";
import { updateProduct } from "@/app/actions/AdminActions";

type ProductEditPageProps = {
    params: Promise<{ id: string; }>;
    searchParams: SearchParamsType;
}

export default async function ProductEditPage({ params, searchParams }: ProductEditPageProps) {
    const resolvedParams = await params;
    const sp = await searchParams;
    const productId = parseInt(resolvedParams.id);
    const mode = sp.mode || 'view';
    const isEditing = mode === 'edit';

    if (isNaN(productId)) {
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
        salesCount: salesData?.salesCount || 0
    };

    const colors = JSON.parse(product.colors || '[]');
    const sizes = product.sizes ? JSON.parse(product.sizes) : [];
    const tags = JSON.parse(product.tags || '[]');
    const about = JSON.parse(product.about || '[]');

    const finalPrice = product.price * (1 - product.discount / 100);

    async function handleUpdateProduct(formData: FormData) {
        'use server';

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const discount = parseFloat(formData.get('discount') as string || '0');
        const category = formData.get('category') as string;
        const brand = formData.get('brand') as string;
        const stock = parseInt(formData.get('stock') as string);
        const weight = parseInt(formData.get('weight') as string);
        const dimensionsLength = parseFloat(formData.get('dimensionsLength') as string);
        const dimensionsWidth = parseFloat(formData.get('dimensionsWidth') as string);
        const dimensionsHeight = parseFloat(formData.get('dimensionsHeight') as string);
        const img = formData.get('img') as string;
        const imgAlt = formData.get('imgAlt') as string;
        const featured = formData.get('featured') === 'on' ? 1 : 0;
        const freeShipping = formData.get('freeShipping') === 'on' ? 1 : 0;
        const shippingDays = parseInt(formData.get('shippingDays') as string);
        const shippingCost = parseFloat(formData.get('shippingCost') as string || '0');
        const warrantyDuration = parseInt(formData.get('warrantyDuration') as string);
        const warrantyType = formData.get('warrantyType') as string;

        const colorsInput = formData.get('colors') as string;
        const sizesInput = formData.get('sizes') as string;
        const tagsInput = formData.get('tags') as string;
        const aboutInput = formData.get('about') as string;

        const productData = {
            name,
            description,
            rating: product.avgRating ? Number(product.avgRating) : 0,
            price,
            discount,
            category,
            brand,
            sku: product.sku,
            stock,
            weight,
            dimensionsLength,
            dimensionsWidth,
            dimensionsHeight,
            img: img || null,
            imgAlt: imgAlt || null,
            featured,
            shippingFreeShipping: freeShipping,
            shippingEstimatedDays: shippingDays,
            shippingCost,
            warrantyDuration,
            warrantyType,
            colors: colorsInput,
            sizes: sizesInput || null,
            tags: tagsInput,
            about: aboutInput,
        };

        try {
            const result = await updateProduct(productId, productData);

            if ('success' in result && !result.success) {
                throw new Error(result.error);
            }

            redirect(`/admin/products/${productId}?mode=view`);
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    }

    return (
        <div className="flex flex-col w-full gap-6 p-4 lg:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products"
                        className="p-2 hover:bg-[#2a3038] rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-2xl lg:text-3xl text-white">
                            {isEditing ? 'Edit Product' : product.name}
                        </h1>
                        <p className="text-gray-400">
                            SKU: #{product.sku} • Added: {new Date(product.dateAdded).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Link
                                href={`/admin/products/${product.id}?mode=view`}
                                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Cancel
                            </Link>
                            <button
                                form="product-form"
                                type="submit"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                                text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <Link
                            href={`/admin/products/${product.id}?mode=edit`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                            text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Product
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Stock Level</p>
                            <p className="text-2xl font-bold text-white">{product.stock}</p>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <Package className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Average Rating</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {product.avgRating ? Number(product.avgRating).toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">{product.reviewCount} reviews</p>
                        </div>
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Sales</p>
                            <p className="text-2xl font-bold text-green-400">{product.salesCount}</p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <form id="product-form" action={handleUpdateProduct} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            defaultValue={product.name}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    {isEditing ? (
                                        <textarea
                                            name="description"
                                            rows={3}
                                            defaultValue={product.description}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="category"
                                                defaultValue={product.category}
                                                className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-200">{product.category}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="brand"
                                                defaultValue={product.brand}
                                                className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white 
                                                focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-200">{product.brand}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Pricing & Inventory</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="price"
                                            defaultValue={product.price}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">${product.price.toFixed(2)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Discount (%)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            name="discount"
                                            defaultValue={product.discount}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.discount}%</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Final Price</label>
                                    <p className="text-green-400 font-semibold text-lg">${finalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            name="stock"
                                            defaultValue={product.stock}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.stock} units</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Weight (g)</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            min="0"
                                            name="weight"
                                            defaultValue={product.weight}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.weight}g</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Dimensions (cm)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            name="dimensionsLength"
                                            defaultValue={product.dimensionsLength}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.dimensionsLength} cm</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Width</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            name="dimensionsWidth"
                                            defaultValue={product.dimensionsWidth}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.dimensionsWidth} cm</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            name="dimensionsHeight"
                                            defaultValue={product.dimensionsHeight}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    ) : (
                                        <p className="text-gray-200">{product.dimensionsHeight} cm</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Warranty */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Shipping & Warranty</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            name="freeShipping"
                                            defaultChecked={product.shippingFreeShipping === 1}
                                            className="w-4 h-4 text-[#ffb100] bg-[#2a3038] border-[#3a404a] rounded focus:ring-[#ffb100]"
                                        />
                                    ) : (
                                        <div className={`w-4 h-4 rounded ${product.shippingFreeShipping ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                    )}
                                    <label className="text-sm font-medium text-gray-300">Free Shipping</label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Cost ($)</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                name="shippingCost"
                                                defaultValue={product.shippingCost}
                                                className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            />
                                        ) : (
                                            <p className="text-gray-200">${product.shippingCost.toFixed(2)}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Days</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="1"
                                                name="shippingDays"
                                                defaultValue={product.shippingEstimatedDays}
                                                className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-200">{product.shippingEstimatedDays} days</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Warranty Duration (months)</label>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                name="warrantyDuration"
                                                defaultValue={product.warrantyDuration}
                                                className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-200">{product.warrantyDuration} months</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Warranty Type</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="warrantyType"
                                                defaultValue={product.warrantyType}
                                                className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-gray-200">{product.warrantyType}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* JSON Fields */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Additional Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Colors (JSON)</label>
                                    {isEditing ? (
                                        <textarea
                                            name="colors"
                                            rows={3}
                                            defaultValue={product.colors}
                                            placeholder='[{"colorName": "Red", "colorHex": "#FF0000"}]'
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                            required
                                        />
                                    ) : (
                                        <div className="flex gap-2 flex-wrap">
                                            {colors.map((color: { colorName: string; colorHex: string }, index: number) => (
                                                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a3038] rounded-lg text-sm">
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-500"
                                                        style={{ backgroundColor: color.colorHex }}
                                                    ></div>
                                                    {color.colorName}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sizes (JSON)</label>
                                    {isEditing ? (
                                        <textarea
                                            name="sizes"
                                            rows={2}
                                            defaultValue={product.sizes || ''}
                                            placeholder='["S", "M", "L", "XL"]'
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                        />
                                    ) : (
                                        <div className="flex gap-2 flex-wrap">
                                            {sizes.map((size: string, index: number) => (
                                                <span key={index} className="px-3 py-1 bg-[#2a3038] rounded-lg text-sm">
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (JSON)</label>
                                    {isEditing ? (
                                        <textarea
                                            name="tags"
                                            rows={2}
                                            defaultValue={product.tags}
                                            placeholder='["tag1", "tag2", "tag3"]'
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                            required
                                        />
                                    ) : (
                                        <div className="flex gap-2 flex-wrap">
                                            {tags.map((tag: string, index: number) => (
                                                <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">About Points (JSON)</label>
                                    {isEditing ? (
                                        <textarea
                                            name="about"
                                            rows={5}
                                            defaultValue={product.about}
                                            placeholder='["Point 1", "Point 2", "Point 3"]'
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                            required
                                        />
                                    ) : (
                                        <ul className="space-y-2">
                                            {about.map((point: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#ffb100] mt-2 flex-shrink-0"></span>
                                                    <span className="text-gray-200">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Image & Settings */}
                    <div className="space-y-6">
                        {/* Product Image */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Product Image</h2>

                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#2a3038] mb-4">
                                {product.img ? (
                                    <Image
                                        src={product.img}
                                        alt={product.imgAlt || product.name}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            name="img"
                                            defaultValue={product.img || ''}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm break-all">{product.img || 'No image'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Alt Text</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="imgAlt"
                                            defaultValue={product.imgAlt || ''}
                                            placeholder="Descriptive text for the image"
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm">{product.imgAlt || 'No alt text'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Product Settings */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Product Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-[#2a3038] rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-200">Featured Product</h3>
                                        <p className="text-sm text-gray-400">Show on homepage</p>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            defaultChecked={product.featured === 1}
                                            className="w-5 h-5 text-[#ffb100] bg-[#1e232b] border-[#3a404a] rounded focus:ring-[#ffb100] focus:ring-2"
                                        />
                                    ) : (
                                        <div className={`w-5 h-5 rounded ${product.featured === 1 ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                                    )}
                                </div>

                                <div className="p-3 bg-[#2a3038] rounded-lg">
                                    <h3 className="font-medium text-gray-200 mb-2">Product Status</h3>
                                    <div className="flex items-center gap-2">
                                        {product.stock > 0 ? (
                                            <>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <span className="text-green-400 text-sm">Active & In Stock</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <span className="text-red-400 text-sm">Out of Stock</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 bg-[#2a3038] rounded-lg">
                                    <h3 className="font-medium text-gray-200 mb-2">Last Updated</h3>
                                    <p className="text-gray-400 text-sm">
                                        {new Date(product.lastUpdated).toLocaleDateString()} at{' '}
                                        {new Date(product.lastUpdated).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
                            <h2 className="text-xl font-semibold text-white mb-4">Quick Stats</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Product ID</span>
                                    <span className="text-gray-200 font-mono">#{product.id}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">SKU</span>
                                    <span className="text-gray-200 font-mono">{product.sku}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Views</span>
                                    <span className="text-gray-200">-</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Conversion Rate</span>
                                    <span className="text-gray-200">-</span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-[#2a3038]">
                                    <span className="text-gray-400 text-sm">Revenue</span>
                                    <span className="text-green-400 font-semibold">
                                        ${(finalPrice * product.salesCount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
