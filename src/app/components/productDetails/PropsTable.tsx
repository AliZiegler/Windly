import { ProductType } from "@/app/components/global/Types"
export default function PropsTable({ p, className }: { p: ProductType, className?: string }) {
    return (
        <table className={className}>
            <tbody>
                <tr>
                    <td className="font-bold">Brand:</td>
                    <td>{p.brand}</td>
                </tr>
                <tr>
                    <td className="font-bold">Dimensions:</td>
                    <td>
                        {p.dimensions.length} x {p.dimensions.width} x
                        {" "}
                        {p.dimensions.height} cm
                    </td>
                </tr>
                <tr>
                    <td className="font-bold">Weight:</td>
                    <td>{p.weight} g</td>
                </tr>
                <tr>
                    <td className="font-bold">SKU:</td>
                    <td>{p.sku}</td>
                </tr>
                <tr>
                    <td className="font-bold">Stock:</td>
                    <td>{p.stock}</td>
                </tr>
                <tr>
                    <td className="font-bold">Date added:</td>
                    <td>{p.dateAdded.toLocaleDateString()}</td>
                </tr>
                <tr>
                    <td className="font-bold">Category:</td>
                    <td>{p.category}</td>
                </tr>
            </tbody>
        </table>
    )
}
