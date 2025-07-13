import SignOut from "@/app/components/global/SignOut";
import Link from "next/link"
export default function AccountSideBar() {
    const links = ["Account Information", "Wishlist", "Address", "Reviews", "Orders"];
    const liLinks = links.map((link) => (
        <li key={link} className="border-b-1 border-gray-400 py-2 hover:font-extrabold">
            <Link href={link !== "Account Information" ? `/account/${link.toLowerCase()}` : "/account"}>{link}</Link></li>
    ))
    return (
        <div className="w-72 h-[340px] text-[#FCECDD] border-r-1 border-gray-400 pr-3">
            <h2 className="text-2xl mb-2">Welcome</h2>
            <ul>
                {liLinks}
            </ul>
            <SignOut className="cursor-pointer h-8 w-32 bg-red-500 rounded-md flex items-center gap-2 pl-1 mt-4" />
            <hr className="mt-5 border-gray-400" />
        </div>
    );
}
