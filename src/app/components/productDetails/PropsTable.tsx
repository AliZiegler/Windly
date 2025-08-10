import { ProductType } from "@/app/components/global/Types"

export default function PropsTable({ p, className }: { p: ProductType, className?: string }) {
    const tableData = [
        { label: "Brand", value: p.brand, icon: "🏷️" },
        {
            label: "Dimensions",
            value: `${p.dimensions.length} × ${p.dimensions.width} × ${p.dimensions.height} cm`,
            icon: "📏"
        },
        { label: "Weight", value: `${p.weight} g`, icon: "⚖️" },
        { label: "SKU", value: p.sku, icon: "#️⃣" },
        { label: "Stock", value: p.stock.toString(), icon: "📦" },
        { label: "Date Added", value: p.dateAdded.toLocaleDateString(), icon: "📅" },
        { label: "Category", value: p.category, icon: "🏪" }
    ];

    return (
        <div className={`space-y-3 ${className}`}>
            {tableData.map((item) => (
                <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-semibold text-gray-300">{item.label}:</span>
                    </div>
                    <span className="text-gray-100 font-medium text-right max-w-[60%] break-words">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    )
}
