import { ProductType } from "@/app/components/global/Products"
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
                        {p.dimensionsLength} x {p.dimensionsWidth} x
                        {" "}
                        {p.dimensionsHeight} cm
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
                    <td>{p.dateAdded}</td>
                </tr>
                <tr>
                    <td className="font-bold">Category:</td>
                    <td>{p.category}</td>
                </tr>
            </tbody>
        </table>
    )
}
