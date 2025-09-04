"use client"
import React, { useState, useMemo } from "react";
import { Edit, Filter, Package, Search, ChevronDown, X } from "lucide-react";
import Link from "next/link";

type Product = {
    id: number;
    name: string;
    category: string;
    price: string;
    stock: string;
    status: string;
};

type ProductsManagementProps = {
    recentProducts: Product[];
};

export default function ProductsManagement({ recentProducts = [] }: ProductsManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);

    // Filter and search products
    const filteredProducts = useMemo(() => {
        return recentProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === "all" || product.status.toLowerCase() === filterStatus.toLowerCase();
            return matchesSearch && matchesFilter;
        });
    }, [recentProducts, searchTerm, filterStatus]);

    const statusOptions = ["all", "active", "inactive"];

    // Mobile-first product card
    const ProductCard = ({ product }: { product: Product }) => (
        <div className="bg-[#1e232b] rounded-lg p-3 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm leading-tight">{product.name}</p>
                        <p className="text-slate-400 text-xs">ID: {product.id}</p>
                    </div>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2 ${product.status === "Active" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                    }`}>
                    {product.status}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div>
                    <span className="text-slate-400 block">Category</span>
                    <span className="text-white">{product.category}</span>
                </div>
                <div>
                    <span className="text-slate-400 block">Price</span>
                    <span className="text-white">{product.price}</span>
                </div>
                <div>
                    <span className="text-slate-400 block">Stock</span>
                    <span className="text-white">{product.stock}</span>
                </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-700">
                <Link
                    href={`/admin/products/${product.id}`}
                    className="p-1 hover:bg-yellow-500/20 rounded transition-colors"
                >
                    <Edit className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                </Link>
            </div>
        </div>
    );

    return (
        <div className="bg-[#1e232b] rounded-lg border border-gray-700 w-full overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-3">Products Management</h2>

                {/* Search and Filter */}
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-2 w-full bg-[#222831] border border-gray-600 rounded text-white text-sm
                                     placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center w-full justify-center text-sm"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter: {filterStatus}
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilters && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#222831] border border-gray-600 rounded shadow-lg z-20">
                                <div className="p-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-300 text-sm font-medium">Status</span>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setFilterStatus(status);
                                                setShowFilters(false);
                                            }}
                                            className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors capitalize ${filterStatus === status
                                                    ? "bg-teal-600 text-white"
                                                    : "text-slate-300 hover:bg-gray-700"
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-2 text-xs text-slate-400">
                    Showing {filteredProducts.length} of {recentProducts.length} products
                </div>
            </div>

            {/* Content - Always Cards on Mobile */}
            <div className="max-h-96 overflow-y-auto">
                <div className="p-3">
                    {filteredProducts.length > 0 ? (
                        <div className="space-y-3">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm mb-1">No products found</p>
                            <p className="text-slate-500 text-xs">Try adjusting your search or filter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
