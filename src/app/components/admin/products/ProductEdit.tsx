import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Star, Package, TrendingUp, Eye } from "lucide-react";
import { redirect } from "next/navigation";
import { updateProduct } from "@/app/actions/AdminActions";
import ColorManager from "@/app/components/admin/products/ColorManager";
import SizeManager from "@/app/components/admin/products/SizeManager";
import TagManager from "@/app/components/admin/products/TagManager";
import AboutPointsManager from "@/app/components/admin/products/AboutPointsManager";

type ProductData = {
    id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    img: string | null;
    imgAlt: string | null;
    category: string;
    brand: string;
    stock: number;
    weight: number;
    dimensionsLength: number;
    dimensionsWidth: number;
    dimensionsHeight: number;
    colors: string;
    sizes: string | null;
    tags: string;
    sku: string;
    featured: number;
    shippingFreeShipping: number;
    shippingEstimatedDays: number;
    shippingCost: number;
    warrantyDuration: number;
    warrantyType: string;
    about: string;
    dateAdded: Date;
    lastUpdated: Date;
    avgRating: number | null;
    reviewCount: number;
    salesCount: number;
};

type ProductEditProps = {
    product: ProductData;
    sellerPage?: boolean;
};

const Section = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="bg-[#1e232b] rounded-xl p-6 border border-[#2a3038]">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        {children}
    </div>
);
export default function ProductEdit({ product, sellerPage = false }: ProductEditProps) {
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
        const colors = JSON.stringify(formData.get("colors") ? JSON.parse(formData.get("colors") as string) : []);
        const sizes = JSON.stringify(formData.get("sizes") ? JSON.parse(formData.get("sizes") as string) : []);
        const tags = JSON.stringify(formData.get("tags") ? JSON.parse(formData.get("tags") as string) : []);
        const about = JSON.stringify(formData.get("about") ? JSON.parse(formData.get("about") as string) : []);

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
            colors,
            sizes,
            tags,
            about
        };

        try {
            await updateProduct(product.id, productData);
            redirect(`/${sellerPage ? "account" : "admin"}/products/${product.id}`);
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
                        prefetch
                        href={`/${sellerPage ? "account" : "admin"}/products`}
                        className="p-2 hover:bg-[#2a3038] rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-2xl lg:text-3xl text-white">
                            Edit Product
                        </h1>
                        <p className="text-gray-400">
                            SKU: #{product.sku} • Added: {new Date(product.dateAdded).toLocaleDateString("en-GB")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        prefetch
                        href={`/${sellerPage ? "account" : "admin"}/products/${product.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Cancel
                    </Link>
                    <button
                        form="product-form"
                        type="submit"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 cursor-pointer"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
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

            {/* Main Content - Form */}
            <form id="product-form" action={handleUpdateProduct} className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Section title="Basic Information">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={product.name}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        defaultValue={product.description}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            defaultValue={product.category}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            defaultValue={product.brand}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white 
                                            focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Pricing & Inventory */}
                        <Section title="Pricing & Inventory">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        defaultValue={product.price}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Discount (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        name="discount"
                                        defaultValue={product.discount}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Final Price</label>
                                    <p className="text-green-400 font-semibold text-lg">${finalPrice.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="stock"
                                        defaultValue={product.stock}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Weight (g)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="weight"
                                        defaultValue={product.weight}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Dimensions */}
                        <Section title="Dimensions (cm)">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        name="dimensionsLength"
                                        defaultValue={product.dimensionsLength}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Width</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        name="dimensionsWidth"
                                        defaultValue={product.dimensionsWidth}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        name="dimensionsHeight"
                                        defaultValue={product.dimensionsHeight}
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Shipping & Warranty */}
                        <Section title="Shipping & Warranty">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="freeShipping"
                                        defaultChecked={product.shippingFreeShipping === 1}
                                        className="w-4 h-4 text-[#ffb100] bg-[#2a3038] border-[#3a404a] rounded focus:ring-[#ffb100]"
                                    />
                                    <label className="text-sm font-medium text-gray-300">Free Shipping</label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Cost ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="shippingCost"
                                            defaultValue={product.shippingCost}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Days</label>
                                        <input
                                            type="number"
                                            min="1"
                                            name="shippingDays"
                                            defaultValue={product.shippingEstimatedDays}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Warranty Duration (months)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            name="warrantyDuration"
                                            defaultValue={product.warrantyDuration}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Warranty Type</label>
                                        <input
                                            type="text"
                                            name="warrantyType"
                                            defaultValue={product.warrantyType}
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* JSON Fields */}
                        <Section title="Additional Details">
                            <ColorManager initialColors={JSON.parse(product.colors)} />
                            <SizeManager initialSizes={JSON.parse(product.sizes || "[]")} />
                            <TagManager initialTags={JSON.parse(product.tags || "[]")} />
                            <AboutPointsManager initialPoints={JSON.parse(product.about || "[]")} />
                        </Section>
                    </div>

                    {/* Right Column - Image & Settings */}
                    <div className="space-y-6">
                        {/* Product Image */}
                        <Section title="Product Image">
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
                                    <input
                                        type="url"
                                        name="img"
                                        defaultValue={product.img || ''}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Alt Text</label>
                                    <input
                                        type="text"
                                        name="imgAlt"
                                        defaultValue={product.imgAlt || ''}
                                        placeholder="Descriptive text for the image"
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] text-sm"
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Product Settings */}
                        <Section title="Product Settings">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-[#2a3038] rounded-lg">
                                    <div>
                                        <h3 className="font-medium text-gray-200">Featured Product</h3>
                                        <p className="text-sm text-gray-400">Show on homepage</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        defaultChecked={product.featured === 1}
                                        className="w-5 h-5 text-[#ffb100] bg-[#1e232b] border-[#3a404a] rounded focus:ring-[#ffb100] focus:ring-2"
                                    />
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
                                        {new Date(product.lastUpdated).toLocaleDateString("en-GB")} at{' '}
                                        {new Date(product.lastUpdated).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        </Section>

                        {/* Quick Stats */}
                        <Section title="Quick Stats">
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
                                    <span className="text-gray-400 text-sm">Rating</span>
                                    <span className="text-gray-200">{product.avgRating}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Sales</span>
                                    <span className="text-gray-200">{product.salesCount}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-[#2a3038]">
                                    <span className="text-gray-400 text-sm">Revenue</span>
                                    <span className="text-green-400 font-semibold">
                                        ${(finalPrice * product.salesCount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>
            </form>
        </div>
    );
}
