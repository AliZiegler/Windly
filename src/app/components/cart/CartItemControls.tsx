"use client";
import { useState, useTransition } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/CartActions";
import { Trash2 } from "lucide-react";

interface CartItemControlsProps {
    cartId: number;
    productId: number;
    quantity: number;
    maxQuantity: number;
}

export default function CartItemControls({
    cartId,
    productId,
    quantity,
    maxQuantity
}: CartItemControlsProps) {
    const [currentQuantity, setCurrentQuantity] = useState(quantity);
    const [isPending, startTransition] = useTransition();

    function updateQuantity(newQuantity: number) {
        if (newQuantity < 1 || newQuantity > maxQuantity) return;

        setCurrentQuantity(newQuantity);
        startTransition(() => {
            updateCartItemQuantity(cartId, productId, newQuantity);
        });
    };

    function removeItem() {
        startTransition(() => {
            removeFromCart(cartId, productId);
        });
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => updateQuantity(currentQuantity - 1)}
                    disabled={currentQuantity <= 1 || isPending}
                    className="w-8 h-8 rounded-lg border border-gray-600 text-white font-bold disabled:opacity-50 
                    disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: "#1e252d" }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#252c35")}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#1e252d")}
                >
                    −
                </button>

                <div className="flex items-center justify-center w-12 h-8 border border-gray-600 rounded-lg text-white font-medium" style={{ backgroundColor: "#1e252d" }}>
                    {currentQuantity}
                </div>

                <button
                    onClick={() => updateQuantity(currentQuantity + 1)}
                    disabled={currentQuantity >= maxQuantity || isPending}
                    className="w-8 h-8 rounded-lg border border-gray-600 text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    style={{ backgroundColor: "#1e252d" }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#252c35")}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = "#1e252d")}
                >
                    +
                </button>
            </div>

            <button
                onClick={removeItem}
                disabled={isPending}
                className="flex items-center justify-center gap-1 px-3 py-2 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-300/50 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm font-medium cursor-pointer"
                style={{ backgroundColor: "transparent" }}
            >
                <Trash2 size={16} />
                {isPending ? "Processing..." : "Remove"}
            </button>
        </div>
    );
}
