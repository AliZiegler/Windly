import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star, Package, TrendingUp, Edit3 } from "lucide-react";

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

type ProductViewProps = { product: ProductData, sellerPage?: boolean };

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

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <span className="text-gray-200">{value}</span>
    </div>
);

export default function ProductView({ product, sellerPage = false }: ProductViewProps) {
    const colors = JSON.parse(product.colors || "[]");
    const sizes = product.sizes ? JSON.parse(product.sizes) : [];
    const tags = JSON.parse(product.tags || "[]");
    const about = JSON.parse(product.about || "[]");
    const finalPrice = product.price * (1 - product.discount / 100);
    const updatedAt = new Date(product.lastUpdated);

    const statCards = [
        {
            label: "Stock Level",
            value: product.stock,
            color: "blue",
            icon: <Package className="w-6 h-6 text-blue-400" />,
        },
        {
            label: "Average Rating",
            value: product.avgRating ? Number(product.avgRating).toFixed(1) : "N/A",
            extra: `${product.reviewCount} reviews`,
            color: "yellow",
            icon: <Star className="w-6 h-6 text-yellow-400" />,
        },
        {
            label: "Total Sales",
            value: product.salesCount,
            color: "green",
            icon: <TrendingUp className="w-6 h-6 text-green-400" />,
        },
    ];

    const quickStats = [
        ["Product ID", `#${product.id}`],
        ["SKU", product.sku],
        ["Rating", product.avgRating],
        ["Sales", product.salesCount],
    ];

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
                            {product.name}
                        </h1>
                        <p className="text-gray-400">
                            SKU: #{product.sku} • Added:{" "}
                            {new Date(product.dateAdded).toLocaleDateString("en-GB")}
                        </p>
                    </div>
                </div>
                <Link
                    prefetch
                    href={`/${sellerPage ? "account" : "admin"}/products/${product.id}?mode=edit`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ffb100] to-[#ff9500] text-black font-bold 
                    rounded-lg hover:from-[#e0a000] hover:to-[#e08500] transition-all duration-200"
                >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-[#1e232b] rounded-xl p-4 border border-[#2a3038]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">{s.label}</p>
                                <p
                                    className={`text-2xl font-bold ${s.color === "yellow"
                                        ? "text-yellow-400"
                                        : s.color === "green"
                                            ? "text-green-400"
                                            : "text-white"
                                        }`}
                                >
                                    {s.value}
                                </p>
                                {s.extra && <p className="text-xs text-gray-400">{s.extra}</p>}
                            </div>
                            <div className={`p-3 bg-${s.color}-500/20 rounded-lg`}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left */}
                <div className="xl:col-span-2 space-y-6">
                    <Section title="Basic Information">
                        <div className="space-y-4">
                            <Field label="Product Name" value={product.name} />
                            <Field label="Description" value={product.description} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Category" value={product.category} />
                                <Field label="Brand" value={product.brand} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Pricing & Inventory">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Price ($)" value={`$${product.price.toFixed(2)}`} />
                            <Field label="Discount (%)" value={`${product.discount}%`} />
                            <Field
                                label="Final Price"
                                value={<span className="text-green-400 font-semibold text-lg">${finalPrice.toFixed(2)}</span>}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Field label="Stock Quantity" value={`${product.stock} units`} />
                            <Field label="Weight (g)" value={`${product.weight}g`} />
                        </div>
                    </Section>

                    <Section title="Dimensions (cm)">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Length" value={`${product.dimensionsLength} cm`} />
                            <Field label="Width" value={`${product.dimensionsWidth} cm`} />
                            <Field label="Height" value={`${product.dimensionsHeight} cm`} />
                        </div>
                    </Section>

                    <Section title="Shipping & Warranty">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded ${product.shippingFreeShipping ? "bg-green-500" : "bg-gray-500"}`} />
                                <span className="text-sm font-medium text-gray-300">Free Shipping</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Shipping Cost ($)" value={`$${product.shippingCost.toFixed(2)}`} />
                                <Field label="Estimated Days" value={`${product.shippingEstimatedDays} days`} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Warranty Duration (months)" value={`${product.warrantyDuration} months`} />
                                <Field label="Warranty Type" value={product.warrantyType} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Additional Details">
                        <div className="space-y-4">
                            <Field
                                label="Colors"
                                value={
                                    <div className="flex gap-2 flex-wrap">
                                        {colors.map((c: { colorName: string; colorHex: string }, i: number) => (
                                            <span key={i} className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a3038] rounded-lg text-sm">
                                                <div className="w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: c.colorHex }} />
                                                {c.colorName}
                                            </span>
                                        ))}
                                    </div>
                                }
                            />
                            <Field
                                label="Sizes"
                                value={
                                    <div className="flex gap-2 flex-wrap">
                                        {sizes.map((s: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-[#2a3038] rounded-lg text-sm">{s}</span>
                                        ))}
                                    </div>
                                }
                            />
                            <Field
                                label="Tags"
                                value={
                                    <div className="flex gap-2 flex-wrap">
                                        {tags.map((t: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30">{t}</span>
                                        ))}
                                    </div>
                                }
                            />
                            <Field
                                label="About Points"
                                value={
                                    <ul className="space-y-2">
                                        {about.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#ffb100] mt-2 flex-shrink-0" />
                                                <span className="text-gray-200">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        </div>
                    </Section>
                </div>

                {/* Right */}
                <div className="space-y-6">
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
                        <Field label="Image URL" value={product.img || "No image"} />
                        <Field label="Alt Text" value={product.imgAlt || "No alt text"} />
                    </Section>

                    <Section title="Product Settings">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-[#2a3038] rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-200">Featured Product</h3>
                                    <p className="text-sm text-gray-400">Show on homepage</p>
                                </div>
                                <div className={`w-5 h-5 rounded ${product.featured ? "bg-yellow-500" : "bg-gray-500"}`} />
                            </div>
                            <div className="p-3 bg-[#2a3038] rounded-lg">
                                <h3 className="font-medium text-gray-200 mb-2">Product Status</h3>
                                <div className="flex items-center gap-2">
                                    {product.stock > 0 ? (
                                        <>
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className="text-green-400 text-sm">Active & In Stock</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="text-red-400 text-sm">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="p-3 bg-[#2a3038] rounded-lg">
                                <h3 className="font-medium text-gray-200 mb-2">Last Updated</h3>
                                <p className="text-gray-400 text-sm">
                                    {updatedAt.toLocaleDateString("en-GB")} at {updatedAt.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Quick Stats">
                        <div className="space-y-3">
                            {quickStats.map(([k, v], i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">{k}</span>
                                    <span className="text-gray-200 font-mono">{v}</span>
                                </div>
                            ))}
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
        </div>
    );
}
