"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/CartActions";
import { ShoppingCart, Check } from "lucide-react";

export default function AddToCartButton({ productId }: { productId: number }) {
    const [added, setAdded] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = () => {
        startTransition(async () => {
            await addToCart(productId, undefined, 1);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        });
    };

    return (
        <button
            type="button"
            onClick={handleAddToCart}
            disabled={isPending}
            className={`inline-flex items-center justify-center 
                rounded-md text-[11px] font-medium px-2 py-1 min-w-[60px]
                transition-all duration-200 flex-shrink-0
                ${added
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-[#FCECDD] text-black hover:bg-[#f9d7b8]"
                }
                ${isPending
                    ? "opacity-70 cursor-wait"
                    : "cursor-pointer hover:scale-105 active:scale-95"
                }
            `}
        >
            {isPending ? (
                <span className="animate-pulse">...</span>
            ) : added ? (
                <>
                    <Check className="w-3 h-3 mr-1" /> Added
                </>
            ) : (
                <>
                    <ShoppingCart className="w-3 h-3 mr-1" /> Add
                </>
            )}
        </button>
    );
}
