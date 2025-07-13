"use client";
import dynamic from "next/dynamic";
import { ComponentType } from "react";

// Define the props interface based on react-stars documentation
interface ReactStarsProps {
    count?: number;
    value?: number;
    size?: number;
    color1?: string;
    color2?: string;
    half?: boolean;
    edit?: boolean;
    onChange?: (newValue: number) => void;
    className?: string;
    style?: React.CSSProperties;
    // Add other common props as needed
}

const ReactStars = dynamic(
    () => import("react-stars").then((mod) => ({
        default: mod.default as ComponentType<ReactStarsProps>
    })),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center space-x-1 h-6 w-24">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="relative">
                        <svg
                            className="w-5 h-5 text-yellow-400 animate-spin"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                animationDelay: `${i * 100}ms`, // Stagger the animation
                                animationDuration: "1s",
                            }}
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div
                            className="absolute inset-0 w-5 h-5 bg-yellow-400 rounded-full opacity-20 animate-ping"
                            style={{
                                animationDelay: `${i * 100}ms`, // Stagger the glowing effect
                                animationDuration: "1.5s",
                            }}
                        >
                        </div>
                    </div>
                ))}
            </div>
        ),
    }
);

export default ReactStars;
