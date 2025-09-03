import Link from "next/link";
import { ArrowLeft, Plus, Package, Eye } from "lucide-react";
import { redirect } from "next/navigation";
import { addProduct } from "@/app/actions/AdminActions";

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

export default function NewProductPage() {
    async function handleAddProduct(formData: FormData) {
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
        const sku = formData.get('sku') as string;
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
            rating: 0, // New products start with 0 rating
            price,
            discount,
            category,
            brand,
            sku,
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
            const newProduct = await addProduct(productData);
            redirect(`/admin/products/${newProduct.id}`);
        } catch (error) {
            console.error('Failed to add product:', error);
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
                        href="/admin/products"
                        className="p-2 hover:bg-[#2a3038] rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-2xl lg:text-3xl text-white">
                            Add New Product
                        </h1>
                        <p className="text-gray-400">
                            Create a new product for your store
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        prefetch
                        href="/admin/products"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Cancel
                    </Link>
                    <button
                        form="product-form"
                        type="submit"
                        disabled
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] 
                        text-black font-bold rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200 cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Product
                    </button>
                </div>
            </div>

            {/* Info Cards */}

            {/* Main Content - Form */}
            <form id="product-form" action={handleAddProduct} className="space-y-6">
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
                                        placeholder="Enter product name"
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        placeholder="Enter product description"
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">SKU (Stock Keeping Unit)</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        placeholder="e.g., PRD-2024-001"
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
                                            placeholder="e.g., Electronics"
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            placeholder="e.g., Apple"
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
                                        min="0"
                                        name="price"
                                        placeholder="0.00"
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
                                        defaultValue="0"
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Final Price</label>
                                    <p className="text-green-400 font-semibold text-lg h-10 flex items-center">Will calculate</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="stock"
                                        placeholder="0"
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
                                        placeholder="0"
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
                                        placeholder="0.0"
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
                                        placeholder="0.0"
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
                                        placeholder="0.0"
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
                                            defaultValue="0"
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Days</label>
                                        <input
                                            type="number"
                                            min="1"
                                            name="shippingDays"
                                            placeholder="7"
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
                                            placeholder="12"
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Warranty Type</label>
                                        <input
                                            type="text"
                                            name="warrantyType"
                                            placeholder="e.g., Limited Warranty"
                                            className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* JSON Fields */}
                        <Section title="Additional Details">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Colors (JSON)</label>
                                    <textarea
                                        name="colors"
                                        rows={3}
                                        placeholder='[{"colorName": "Red", "colorHex": "#FF0000"}, {"colorName": "Blue", "colorHex": "#0000FF"}]'
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sizes (JSON) - Optional</label>
                                    <textarea
                                        name="sizes"
                                        rows={2}
                                        placeholder='["S", "M", "L", "XL"]'
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (JSON)</label>
                                    <textarea
                                        name="tags"
                                        rows={2}
                                        placeholder='["electronics", "smartphone", "latest"]'
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">About Points (JSON)</label>
                                    <textarea
                                        name="about"
                                        rows={5}
                                        placeholder='["High-quality materials and craftsmanship", "Advanced features for modern users", "Durable design built to last", "Easy to use and maintain", "Excellent customer support included"]'
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Right Column - Image & Settings */}
                    <div className="space-y-6">
                        {/* Product Image */}
                        <Section title="Product Image">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#2a3038] mb-4 flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-400" />
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        name="img"
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100] text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Alt Text</label>
                                    <input
                                        type="text"
                                        name="imgAlt"
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
                                        className="w-5 h-5 text-[#ffb100] bg-[#1e232b] border-[#3a404a] rounded focus:ring-[#ffb100] focus:ring-2"
                                    />
                                </div>

                                <div className="p-3 bg-[#2a3038] rounded-lg">
                                    <h3 className="font-medium text-gray-200 mb-2">Product Status</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-blue-400 text-sm">New Product</span>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Tips */}
                        <Section title="Tips">
                            <div className="space-y-3 text-sm text-gray-400">
                                <p>• Use high-quality images for better conversion</p>
                                <p>• Write detailed descriptions to help customers</p>
                                <p>• Use relevant tags for better discoverability</p>
                                <p>• Set competitive pricing and shipping costs</p>
                                <p>• Ensure SKU is unique across all products</p>
                            </div>
                        </Section>
                    </div>
                </div>
            </form>
        </div>
    );
}
