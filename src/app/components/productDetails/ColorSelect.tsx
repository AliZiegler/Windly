"use client";

import { Fragment } from "react";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { urlString } from "@/app/components/global/Atoms";

interface ColorSelectProps {
    colors: { colorName: string; colorHex: string }[];
    searchParams: Record<string, string | string[] | undefined>;
}

export default function ColorSelect({ colors, searchParams }: ColorSelectProps) {
    const firstColor = colors[0];
    const selectedColor = searchParams.color as string;

    return (
        <div className="flex flex-wrap gap-3">
            {colors.map((color: { colorName: string; colorHex: string }) => {
                let params
                if (color.colorName === firstColor.colorName) {
                    params = updateSearchParams(searchParams, "color", null)
                } else {
                    params = updateSearchParams(searchParams, "color", urlString(color.colorName))
                }

                const isSelected = selectedColor === urlString(color.colorName) ||
                    (!selectedColor && color.colorName === firstColor.colorName);

                return (
                    <Fragment key={color.colorName}>
                        <Link
                            data-tooltip-id={color.colorName}
                            data-tooltip-content={color.colorName}
                            data-tooltip-place="bottom"
                            href={`?${params.toString()}`}
                            replace
                            className="group relative"
                        >
                            <div className={`
                                relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 transition-all duration-200
                                ${isSelected
                                    ? 'border-blue-400 shadow-lg shadow-blue-400/30 scale-110'
                                    : 'border-gray-400 hover:border-gray-300 hover:scale-105'
                                }
                                group-hover:shadow-lg
                            `}>
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{ backgroundColor: color.colorHex }}
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                                )}
                            </div>
                        </Link>
                        <Tooltip
                            id={color.colorName}
                            className="!bg-gray-800 !text-gray-100 !border !border-gray-600 !rounded-lg !px-3 !py-2"
                        />
                    </Fragment>
                );
            })}
        </div>
    );
}
