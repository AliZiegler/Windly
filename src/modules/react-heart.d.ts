declare module 'react-heart' {
    import { FC } from 'react';

    interface HeartProps {
        isActive: boolean;
        onClick: () => void;
        animationScale?: number;
        animationTrigger?: 'both' | 'click' | 'hover';
        animationDuration?: number;
        style?: React.CSSProperties;
        activeColor?: string;
        inactiveColor?: string;
        className?: string;
    }

    const Heart: FC<HeartProps>;
    export default Heart;
}
