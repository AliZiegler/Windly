import { ProductType } from "@/app/components/global/Types"
import { Calendar, ChartColumn, Hash, Package, Ruler, Tag, Weight } from "lucide-react";

export default function PropsTable({ p, className }: { p: ProductType, className?: string }) {
    const tableData = [
        { label: "Brand", value: p.brand, icon: Tag },
        {
            label: "Dimensions",
            value: `${p.dimensions.length} × ${p.dimensions.width} × ${p.dimensions.height} cm`,
            icon: Ruler
        },
        { label: "Weight", value: `${p.weight / 1000} kg`, icon: Weight },
        { label: "SKU", value: p.sku, icon: Hash },
        { label: "Stock", value: p.stock.toString(), icon: Package },
        { label: "Date Added", value: p.dateAdded.toLocaleDateString(), icon: Calendar },
        { label: "Category", value: p.category, icon: ChartColumn }
    ];

    return (
        <div className={`space-y-3 ${className}`}>
            {tableData.map((item) => {
                const Icon = item.icon
                return (
                    <div
                        key={item.label}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg"><Icon /></span>
                            <span className="font-semibold text-gray-300">{item.label}:</span>
                        </div>
                        <span className="text-gray-100 font-medium text-right max-w-[60%] break-words">
                            {item.value}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
