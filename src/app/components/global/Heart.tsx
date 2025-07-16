'use client';
import { updateWishlist } from '@/app/actions/UserActions';
import Heart from "react-heart"
import { useState, useTransition } from 'react';

type HeartButtonProps = {
    productId: number;
    isWishlisted: boolean;
    size?: number;
    className?: string;
}

export default function HeartButton({ productId, isWishlisted, size = 20, className = "" }: HeartButtonProps) {
    const [isActive, setIsActive] = useState(isWishlisted);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            try {
                setIsActive(!isActive);

                await updateWishlist(productId);
            } catch (error) {
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
                onClick={() => { }}
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
