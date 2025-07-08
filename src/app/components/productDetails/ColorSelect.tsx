"use client";

import { Fragment } from "react";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { ProductType } from "@/app/components/global/Types";
import { urlString } from "@/app/components/global/Atoms";

interface ColorSelectProps {
    product: ProductType;
    searchParams: URLSearchParams;
}

export default function ColorSelect({ product, searchParams }: ColorSelectProps) {
    const baseParams = new URLSearchParams(searchParams);
    baseParams.delete("name");
    const firstColor = product.colors[0];

    return (
        <span className="flex gap-2 mt-2">
            {product.colors.map((color: { colorName: string; colorHex: string }) => {
                const params = new URLSearchParams(baseParams);
                if (color.colorName === firstColor.colorName) {
                    params.delete("color");
                } else {
                    params.set("color", urlString(color.colorName.toLowerCase()));
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
