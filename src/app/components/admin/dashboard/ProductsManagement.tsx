"use client"
import React, { useState, useMemo, useEffect } from "react";
import { Edit, Eye, Filter, Package, Search, Trash2, ChevronDown, X } from "lucide-react";

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
    const [viewMode, setViewMode] = useState<"table" | "cards">("table");
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive behavior
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1000);
            setViewMode(window.innerWidth < 1000 ? "cards" : "table");
        };

        // Set initial value
        checkIsMobile();

        // Add event listener for window resize
        window.addEventListener('resize', checkIsMobile);

        // Cleanup event listener
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

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

    // Mobile card view component
    const ProductCard = ({ product }: { product: Product }) => (
        <div className="bg-[#2e3238] rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg mr-3 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{product.name}</p>
                        <p className="text-slate-400 text-sm">ID: {product.id}</p>
                    </div>
                </div>
                <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${product.status === "Active"
                        ? "bg-green-900 text-green-300"
                        : "bg-red-900 text-red-300"
                        }`}
                >
                    {product.status}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
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

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-700">
                <button className="text-teal-400 hover:text-teal-300 transition-colors p-1">
                    <Eye className="w-4 h-4" />
                </button>
                <button className="text-slate-400 hover:text-slate-300 transition-colors p-1">
                    <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-400 hover:text-red-300 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-[#393e46] rounded-lg border border-gray-700 w-full">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-semibold text-white">Products Management</h2>
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle - Hidden on mobile */}
                        <div className="hidden sm:flex bg-[#222831] rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === "table" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode("cards")}
                                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === "cards" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                Cards
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full bg-[#222831] border border-gray-600 rounded-lg text-white 
                       placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors w-full sm:w-auto justify-center"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilters && (
                            <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-48 mt-2 bg-[#222831] border border-gray-600 rounded-lg shadow-lg z-20">
                                <div className="p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-300 text-sm font-medium">Status</span>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="text-slate-400 hover:text-white sm:hidden"
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
                                            className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors capitalize ${filterStatus === status
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
                <div className="mt-3 text-sm text-slate-400">
                    Showing {filteredProducts.length} of {recentProducts.length} products
                </div>
            </div>

            {/* Content */}
            {viewMode === "cards" || isMobile ? (
                // Card View (Mobile-first) with scrollable container
                <div className="max-h-[600px] overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        {filteredProducts.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg mb-2">No products found</p>
                                <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Table View (Desktop)
                <div className="overflow-x-auto">
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#2e3238] sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#393e46] divide-y divide-gray-700">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-[#2e3238] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gray-600 rounded-lg mr-3 flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white font-medium truncate">{product.name}</p>
                                                        <p className="text-slate-400 text-sm">ID: {product.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{product.category}</td>
                                            <td className="px-6 py-4 text-slate-300">{product.price}</td>
                                            <td className="px-6 py-4 text-slate-300">{product.stock}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${product.status === "Active"
                                                        ? "bg-green-900 text-green-300"
                                                        : "bg-red-900 text-red-300"
                                                        }`}
                                                >
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <button className="text-teal-400 hover:text-teal-300 transition-colors p-1">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-slate-400 hover:text-slate-300 transition-colors p-1">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-red-400 hover:text-red-300 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                            <p className="text-slate-400 text-lg mb-2">No products found</p>
                                            <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
