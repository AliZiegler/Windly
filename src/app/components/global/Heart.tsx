'use client';
import { updateWishlist } from '@/app/actions/UserActions';
import { SelectProduct } from '@/db/schema';
import { ProductType } from "@/app/components/global/Types";
import Heart from "react-heart"
import { useState, useTransition } from 'react';

type HeartButtonProps = {
    product: SelectProduct | ProductType;
    isWishlisted: boolean;
    size?: number;
    className?: string;
}

export default function HeartButton({ product, isWishlisted, size = 20, className }: HeartButtonProps) {
    const [isActive, setIsActive] = useState(isWishlisted);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            try {
                // Optimistically update the UI
                setIsActive(!isActive);

                // Call the server action
                await updateWishlist(String(product.id));
            } catch (error) {
                // Revert the optimistic update on error
                setIsActive(isActive);
                console.error('Failed to update wishlist:', error);
            }
        });
    };

    return (
        <div
            className={`cursor-pointer transition-opacity ${isPending ? 'opacity-50' : ''}`}
            onClick={handleClick}
            style={{ width: size, height: size }}
        >
            <Heart
                isActive={isActive}
                onClick={() => { }} // Heart component handles its own click, but we override with our div
                animationScale={1.2}
                animationTrigger="both"
                animationDuration={0.3}
                inactiveColor="white"
                style={{ width: size, height: size }}
                className={className}
            />
        </div>
    );
}
