"use client";

import { Fragment } from "react";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { updateSearchParams } from "@/app/components/global/Atoms";

interface ColorSelectProps {
    colors: { colorName: string; colorHex: string }[];
    searchParams: Record<string, string | string[] | undefined>;
}

export default function ColorSelect({ colors, searchParams }: ColorSelectProps) {
    const firstColor = colors[0];

    return (
        <span className="flex gap-2 mt-2">
            {colors.map((color: { colorName: string; colorHex: string }) => {
                let params
                if (color.colorName === firstColor.colorName) {
                    params = updateSearchParams(searchParams, "color", null)
                } else {
                    params = updateSearchParams(searchParams, "color", color.colorName.toLowerCase())
                }

                return (
                    <Fragment key={color.colorName}>
                        <Link
                            data-tooltip-id={color.colorName}
                            data-tooltip-content={color.colorName}
                            data-tooltip-place="bottom"
                            href={`?${params.toString()}`}
                            className="block"
                        >
                            <div
                                className="w-16 h-16 rounded-md border border-white"
                                style={{ backgroundColor: color.colorHex }}
                            />
                        </Link>
                        <Tooltip id={color.colorName} />
                    </Fragment>
                );
            })}
        </span>
    );
}
