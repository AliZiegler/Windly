"use client";
import { useState, useTransition } from "react";
import { updateCartItemQuantity, removeFromCart } from "@/app/actions/CartActions";

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

    const updateQuantity = (newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > maxQuantity) return;

        setCurrentQuantity(newQuantity);
        startTransition(() => {
            updateCartItemQuantity(cartId, productId, newQuantity);
        });
    };

    const removeItem = () => {
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isPending ? "Removing..." : "Remove"}
            </button>
        </div>
    );
}
