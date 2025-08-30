import AccontLinks from "@/app/components/account/AccountLinks";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full flex flex-col items-center gap-10 my-5">
            <div className="w-full flex items-center">
                <span className="ml-5">
                    <Link
                        title="Back To Users"
                        href="/admin/users"
                        className="flex items-center gap-2 whitespace-nowrap">
                        <ChevronLeft size={20} />
                        <span>Back To Users</span>
                    </Link>
                </span>
                <span className="w-full flex justify-center">
                    <AccontLinks />
                </span>
            </div>
            {children}
        </div>
    );
}
