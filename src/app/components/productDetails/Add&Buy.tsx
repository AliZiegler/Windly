"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Minus, ShoppingCart, CreditCard } from "lucide-react";

type Props = {
    stock: number;
    productId: number;
    buyAction: (productId: number, quantity: number) => Promise<void>;
    addAction: (productId: number, quantity: number) => Promise<void>;
};

export default function AddAndBuy({ stock, productId, buyAction, addAction }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState<"add" | "buy" | null>(null);

    const handleAction = async (
        action: (productId: number, quantity: number) => Promise<void>,
        type: "add" | "buy"
    ) => {
        setLoading(type);
        try {
            await action(productId, quantity);
        } catch (error) {
            console.error("Action failed:", error);
        } finally {
            setLoading(null);
        }
    };

    const maxQuantity = Math.min(stock, 10);

    return (
        <div className="space-y-4 p-4 w-full rounded-xl">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quantity
                </label>
                <div className="flex items-center justify-center bg-gray-700 rounded-lg overflow-hidden shadow-inner">
                    <button
                        className="p-3 hover:bg-gray-600 transition disabled:opacity-40"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || loading !== null}
                    >
                        <Minus className="w-4 h-4 text-white" />
                    </button>
                    <motion.input
                        layout
                        type="number"
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setQuantity(
                                Math.max(1, Math.min(maxQuantity, Number(e.target.value)))
                            )
                        }
                        className="w-16 text-center bg-transparent text-white font-medium focus:outline-none"
                        disabled={loading !== null}
                    />
                    <button
                        className="p-3 hover:bg-gray-600 transition disabled:opacity-40"
                        onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                        disabled={quantity >= maxQuantity || loading !== null}
                    >
                        <Plus className="w-4 h-4 text-white" />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Max: {maxQuantity}</p>
            </div>

            <div className="space-y-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(addAction, "add")}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                    {loading === "add" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <ShoppingCart className="w-5 h-5" />
                    )}
                    {loading === "add" ? "Adding..." : "Add to Cart"}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction(buyAction, "buy")}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                    {loading === "buy" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <CreditCard className="w-5 h-5" />
                    )}
                    {loading === "buy" ? "Processing..." : "Buy Now"}
                </motion.button>
            </div>
        </div>
    );
}
